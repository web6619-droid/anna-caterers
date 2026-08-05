declare module "react-visibility-sensor" {
  import * as React from "react";
  interface VisibilitySensorProps {
    onChange?: (isVisible: boolean) => void;
    active?: boolean;
    partialVisibility?: boolean | "top" | "right" | "bottom" | "left";
    offset?: { top?: number; bottom?: number; left?: number; right?: number };
    minTopValue?: number;
    intervalCheck?: boolean;
    intervalDelay?: number;
    scrollCheck?: boolean;
    scrollDelay?: number;
    scrollThrottle?: number;
    resizeCheck?: boolean;
    resizeDelay?: number;
    resizeThrottle?: number;
    containment?: any;
    delayedCall?: boolean;
    children?: React.ReactNode | ((args: { isVisible: boolean; visibilityRect?: any }) => React.ReactNode);
  }
  const VisibilitySensor: React.FC<VisibilitySensorProps>;
  export default VisibilitySensor;
}
