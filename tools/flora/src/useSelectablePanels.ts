import { useMemo } from "react";
import {
  Cycler,
  OutputHierarchy,
  OutputType,
  OutputTypes,
  Paths,
  ParameterHierarchy,
} from "./Connection/Connection";

export enum PanelType {
  RawOutput = "RawOutput",
  RawImage = "RawImage",
  Parameter = "Parameter",
  Horizon = "Horizon",
  ImageSegments = "ImageSegments",
  LineDetection = "LineDetection",
  ProjectedFieldLines = "ProjectedFieldLines",
  FieldBorder = "FieldBorder",
  BallCandidates = "BallCandidates",
  Localization = "Localization",
  Behavior = "Behavior",
  AudioSpectrums = "AudioSpectrums",
  MotionDispatching = "MotionDispatching",
  Odometry = "Odometry",
  ProjectedLimbs = "ProjectedLimbs",
}
export type RawOutput = {
  panelType: PanelType.RawOutput;
  cycler: Cycler;
  outputType: OutputType;
  path: string;
  type: string;
};
export type RawImage = {
  panelType: PanelType.RawImage;
  cycler: Cycler;
};
export type Parameter = {
  panelType: PanelType.Parameter;
  path: string;
  type: string;
};
export type Horizon = {
  panelType: PanelType.Horizon;
  cycler: Cycler;
};
export type ImageSegments = {
  panelType: PanelType.ImageSegments;
  cycler: Cycler;
};
export type LineDetection = {
  panelType: PanelType.LineDetection;
  cycler: Cycler;
};
export type ProjectedFieldLines = {
  panelType: PanelType.ProjectedFieldLines;
  cycler: Cycler;
};
export type FieldBorder = {
  panelType: PanelType.FieldBorder;
  cycler: Cycler;
};
export type BallCandidates = {
  panelType: PanelType.BallCandidates;
  cycler: Cycler;
};
export type Localization = {
  panelType: PanelType.Localization;
};
export type Behavior = {
  panelType: PanelType.Behavior;
};
export type AudioSpectrums = {
  panelType: PanelType.AudioSpectrums;
};
export type MotionDispatching = {
  panelType: PanelType.MotionDispatching;
};
export type Odometry = {
  panelType: PanelType.Odometry;
};
export type ProjectedLimbs = {
  panelType: PanelType.ProjectedLimbs;
  cycler: Cycler;
};
export type SelectablePanel =
  | RawOutput
  | RawImage
  | AudioSpectrums
  | Horizon
  | BallCandidates
  | Localization
  | Behavior
  | AudioSpectrums
  | LineDetection
  | ProjectedFieldLines
  | ImageSegments
  | Parameter
  | FieldBorder
  | MotionDispatching
  | Odometry
  | ProjectedLimbs;
export type SelectablePanels = { [sortPath: string]: SelectablePanel };

function rawOutputsFromOutputHierarchy(
  outputHierarchy: OutputHierarchy
): SelectablePanels {
  return (
    Object.entries(outputHierarchy) as [Cycler, OutputTypes][]
  ).reduce<SelectablePanels>(
    (previous, [cycler, outputTypes]) => ({
      ...previous,
      ...(
        Object.entries(outputTypes) as [OutputType, Paths][]
      ).reduce<SelectablePanels>(
        (previous, [outputType, paths]) => ({
          ...previous,
          ...(
            Object.entries(paths) as [string, string][]
          ).reduce<SelectablePanels>(
            (previous, [path, type]) => ({
              ...previous,
              [`RawOutput.${cycler}.${outputType}.${path}`]: {
                panelType: PanelType.RawOutput,
                cycler,
                outputType,
                path,
                type,
              },
            }),
            {}
          ),
        }),
        {}
      ),
    }),
    {}
  );
}

function rawImages(): SelectablePanels {
  return {
    "RawImage.VisionTop": {
      panelType: PanelType.RawImage,
      cycler: Cycler.VisionTop,
    },
    "RawImage.VisionBottom": {
      panelType: PanelType.RawImage,
      cycler: Cycler.VisionBottom,
    },
  };
}

function parametersFromOutputHierarchy(
  parameterHierarchy: ParameterHierarchy
): SelectablePanels {
  return (
    Object.entries(parameterHierarchy) as [string, string][]
  ).reduce<SelectablePanels>(
    (previous, [path, type]) => ({
      ...previous,
      [`Parameter.${path}`]: {
        panelType: PanelType.Parameter,
        path,
        type,
      },
    }),
    {}
  );
}

function horizon(): SelectablePanels {
  return {
    "Horizon.VisionTop": {
      panelType: PanelType.Horizon,
      cycler: Cycler.VisionTop,
    },
    "Horizon.VisionBottom": {
      panelType: PanelType.Horizon,
      cycler: Cycler.VisionBottom,
    },
  };
}

function imageSegments(): SelectablePanels {
  return {
    "ImageSegments.VisionTop": {
      panelType: PanelType.ImageSegments,
      cycler: Cycler.VisionTop,
    },
    "ImageSegments.VisionBottom": {
      panelType: PanelType.ImageSegments,
      cycler: Cycler.VisionBottom,
    },
  };
}

function lineDetection(): SelectablePanels {
  return {
    "LineDetection.VisionTop": {
      panelType: PanelType.LineDetection,
      cycler: Cycler.VisionTop,
    },
    "LineDetection.VisionBottom": {
      panelType: PanelType.LineDetection,
      cycler: Cycler.VisionBottom,
    },
  };
}

function projectedFieldLines(): SelectablePanels {
  return {
    "ProjectedFieldLines.VisionTop": {
      panelType: PanelType.ProjectedFieldLines,
      cycler: Cycler.VisionTop,
    },
    "ProjectedFieldLines.VisionBottom": {
      panelType: PanelType.ProjectedFieldLines,
      cycler: Cycler.VisionBottom,
    },
  };
}

function fieldBorder(): SelectablePanels {
  return {
    "FieldBorder.VisionTop": {
      panelType: PanelType.FieldBorder,
      cycler: Cycler.VisionTop,
    },
    "FieldBorder.VisionBottom": {
      panelType: PanelType.FieldBorder,
      cycler: Cycler.VisionBottom,
    },
  };
}

function ballCandidates(): SelectablePanels {
  return {
    "BallCandidates.VisionTop": {
      panelType: PanelType.BallCandidates,
      cycler: Cycler.VisionTop,
    },
    "BallCandidates.VisionBottom": {
      panelType: PanelType.BallCandidates,
      cycler: Cycler.VisionBottom,
    },
  };
}

function localization(): SelectablePanels {
  return {
    Localization: {
      panelType: PanelType.Localization,
    },
  };
}

function behavior(): SelectablePanels {
  return {
    Behavior: {
      panelType: PanelType.Behavior,
    },
  };
}

function motionDispatching(): SelectablePanels {
  return {
    MotionDispatching: {
      panelType: PanelType.MotionDispatching,
    },
  };
}

function audioSpectrums(): SelectablePanels {
  return {
    AudioSpectrums: {
      panelType: PanelType.AudioSpectrums,
    },
  };
}

function odometry(): SelectablePanels {
  return {
    Odometry: {
      panelType: PanelType.Odometry,
    },
  };
}

function projectedLimbs(): SelectablePanels {
  return {
    "ProjectedLimbs.VisionTop": {
      panelType: PanelType.ProjectedLimbs,
      cycler: Cycler.VisionTop,
    },
    "ProjectedLimbs.VisionBottom": {
      panelType: PanelType.ProjectedLimbs,
      cycler: Cycler.VisionBottom,
    },
  };
}

export default function useSelectablePanels(
  outputHierarchy: OutputHierarchy,
  parameterHierarchy: ParameterHierarchy
): SelectablePanels {
  return useMemo(() => {
    return {
      ...rawOutputsFromOutputHierarchy(outputHierarchy),
      ...rawImages(),
      ...parametersFromOutputHierarchy(parameterHierarchy),
      ...horizon(),
      ...imageSegments(),
      ...lineDetection(),
      ...projectedFieldLines(),
      ...fieldBorder(),
      ...ballCandidates(),
      ...localization(),
      ...behavior(),
      ...audioSpectrums(),
      ...motionDispatching(),
      ...odometry(),
      ...projectedLimbs(),
    };
  }, [outputHierarchy, parameterHierarchy]);
}
