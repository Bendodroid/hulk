use std::{iter::once, ops::Range};

use communication::messages::Fields;
use eframe::egui::{
    text::CCursor, text_edit::CCursorRange, Area, Context, Frame, Id, Key, Modifiers, Order,
    Response, ScrollArea, TextEdit, Ui, Widget,
};
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use itertools::chain;

use crate::nao::Nao;

#[derive(Default, Clone, Copy)]
struct CompletionState {
    selected_item: Option<i64>,
}

impl CompletionState {
    fn load(ctx: &Context, id: Id) -> Option<Self> {
        ctx.data().get_temp(id)
    }

    fn store(self, ctx: &Context, id: Id) {
        ctx.data().insert_temp(id, self);
    }
}

pub struct CompletionEdit<'key> {
    key: &'key mut String,
    completion_items: Vec<String>,
}

impl<'key> CompletionEdit<'key> {
    pub fn new(key: &'key mut String, completion_items: Vec<String>) -> Self {
        Self {
            key,
            completion_items,
        }
    }

    pub fn addresses(key: &'key mut String, numbers: Range<u8>) -> Self {
        let completion_items = chain!(
            once("localhost".to_string()),
            numbers.clone().map(|number| format!("10.1.24.{number}")),
            numbers.map(|number| format!("10.0.24.{number}"))
        )
        .collect();

        Self {
            key,
            completion_items,
        }
    }

    pub fn outputs(key: &'key mut String, nao: &Nao) -> Self {
        let completion_items = nao
            .get_output_fields()
            .map(output_fields_to_completion_items)
            .unwrap_or_default();

        Self {
            key,
            completion_items,
        }
    }

    pub fn parameters(key: &'key mut String, nao: &Nao) -> Self {
        let completion_items = nao
            .get_parameter_fields()
            .map(|fields| fields.into_iter().collect())
            .unwrap_or_default();

        Self {
            key,
            completion_items,
        }
    }

    pub fn select_all(text: &str, ui: &mut Ui, id: Id) {
        if let Some(mut state) = TextEdit::load_state(ui.ctx(), id) {
            state.set_ccursor_range(Some(CCursorRange::two(
                CCursor::new(0),
                CCursor::new(text.chars().count()),
            )));
            TextEdit::store_state(ui.ctx(), id, state);
        }
    }
}

impl Widget for CompletionEdit<'_> {
    fn ui(self, ui: &mut Ui) -> Response {
        let mut response = TextEdit::singleline(self.key)
            .hint_text("Subscription Key")
            .lock_focus(true)
            .ui(ui);

        let popup_id = response.id.with("completion_popup");
        let is_open = ui.memory().is_popup_open(popup_id);
        let mut state = CompletionState::load(ui.ctx(), popup_id).unwrap_or_default();
        let matcher = SkimMatcherV2::default();
        let mut completion_text_items: Vec<_> = self
            .completion_items
            .iter()
            .filter_map(|item| {
                matcher
                    .fuzzy_match(item, self.key)
                    .map(|score| (score, item))
            })
            .collect();
        completion_text_items.sort_by_key(|(score, _)| -*score);

        if response.has_focus() != is_open {
            ui.memory().toggle_popup(popup_id);
            if response.gained_focus() {
                CompletionEdit::select_all(self.key, ui, response.id);
            }
        }
        if response.changed() {
            state.selected_item = if completion_text_items.is_empty() {
                None
            } else {
                Some(0)
            };
        }
        response.changed = false;

        if is_open {
            if !completion_text_items.is_empty() {
                let mut input = ui.input_mut();
                if input.consume_key(Modifiers::NONE, Key::ArrowDown)
                    || input.consume_key(Modifiers::NONE, Key::Tab)
                {
                    state.selected_item = Some(
                        (state.selected_item.unwrap_or(-1) + 1)
                            % (completion_text_items.len() as i64),
                    );
                } else if input.consume_key(Modifiers::NONE, Key::ArrowUp)
                    || input.consume_key(eframe::egui::Modifiers::SHIFT, Key::Tab)
                {
                    state.selected_item = Some(
                        (state
                            .selected_item
                            .unwrap_or(completion_text_items.len() as i64)
                            - 1)
                            % (completion_text_items.len() as i64),
                    );
                }
            } else {
                state.selected_item = None;
            }

            if ui.input().key_pressed(Key::Enter) {
                if state.selected_item.is_some() {
                    *self.key = completion_text_items
                        .get(state.selected_item.unwrap() as usize)
                        .unwrap()
                        .1
                        .to_string();
                    state.selected_item = None;
                }
                response.mark_changed();
            }
            let area = Area::new(popup_id)
                .order(Order::Foreground)
                .current_pos(response.rect.left_bottom())
                .show(ui.ctx(), |ui| {
                    Frame::popup(ui.style()).show(ui, |ui| {
                        ScrollArea::vertical().show(ui, |ui| {
                            for (i, completion_item) in
                                completion_text_items.into_iter().enumerate()
                            {
                                let is_selected = Some(i as i64) == state.selected_item;
                                let label = ui.selectable_label(is_selected, completion_item.1);
                                if is_selected {
                                    label.scroll_to_me(None);
                                }
                                if label.is_pointer_button_down_on() {
                                    *self.key = completion_item.1.clone();
                                    response.mark_changed();
                                    ui.memory().close_popup();
                                }
                            }
                        });
                    })
                });
            if ui.input().key_pressed(Key::Escape)
                || response.union(area.response).clicked_elsewhere()
            {
                ui.memory().close_popup();
            }
        } else {
            state.selected_item = None;
        }
        state.store(ui.ctx(), popup_id);
        response
    }
}

pub fn output_fields_to_completion_items(output_fields: Fields) -> Vec<String> {
    output_fields
        .into_iter()
        .flat_map(|(cycler_instance, fields)| {
            fields
                .into_iter()
                .map(move |field| format!("{cycler_instance}.{field}"))
        })
        .collect()
}
