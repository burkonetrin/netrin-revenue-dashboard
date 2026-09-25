import React from "react";

type SvgChildProps = {
  fill?: string;
  stroke?: string;
  children?: React.ReactNode;
};

function resolveFill(
  fill: string | undefined,
  isActive: boolean,
  color?: string,
): string | undefined {
  if (!fill || fill === "none") return undefined;
  return color || (isActive ? "#4F169D" : fill);
}

function resolveStroke(
  stroke: string | undefined,
  isActive: boolean,
  color?: string,
): string | undefined {
  if (!stroke) return undefined;
  return color || (isActive ? "#4F169D" : stroke);
}

function mapSvgChild(
  child: React.ReactElement,
  isActive: boolean,
  color?: string,
): React.ReactElement {
  const props = child.props as SvgChildProps;
  const newProps: SvgChildProps = {};

  const fill = resolveFill(props.fill, isActive, color);
  if (fill) newProps.fill = fill;

  const stroke = resolveStroke(props.stroke, isActive, color);
  if (stroke) newProps.stroke = stroke;

  if (props.children) {
    newProps.children = applyColorToChildren(props.children, isActive, color);
  }

  return React.cloneElement(child, { ...props, ...newProps });
}

export function applyColorToChildren(
  children: React.ReactNode,
  isActive: boolean,
  color?: string,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return mapSvgChild(child, isActive, color);
  });
}

export const SIDEBAR_ICON_ACTIVE_COLOR = "#4F169D";
export const SIDEBAR_ICON_INACTIVE_COLOR = "#71717A";

export function resolveSidebarIconColor(isActive: boolean, color?: string) {
  return color || (isActive ? SIDEBAR_ICON_ACTIVE_COLOR : SIDEBAR_ICON_INACTIVE_COLOR);
}

export function SidebarIconFrame({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </span>
  );
}

export type SidebarIconComponentProps = {
  isActive?: boolean;
  className?: string;
  color?: string;
};

export type SidebarIconRenderContext = {
  iconColor: string;
  isActive: boolean;
  color?: string;
};

type SidebarStrokeIconProps = SidebarIconComponentProps & {
  title: string;
  width?: number;
  height?: number;
  viewBox?: string;
  children: (ctx: SidebarIconRenderContext) => React.ReactNode;
};

export function sidebarStroke(
  iconColor: string,
  overrides?: React.SVGAttributes<SVGPathElement>,
) {
  return { stroke: iconColor, strokeWidth: 1.5, ...overrides };
}

export function SidebarStrokeIcon({
  isActive = false,
  className = "size-6",
  color,
  title,
  width = 24,
  height = 24,
  viewBox = "0 0 24 24",
  children,
}: SidebarStrokeIconProps) {
  const iconColor = resolveSidebarIconColor(isActive, color);

  return (
    <SidebarIconFrame>
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <title>{title}</title>
        {children({ iconColor, isActive, color })}
      </svg>
    </SidebarIconFrame>
  );
}

export function createSidebarStrokeIcon(
  title: string,
  renderContent: (ctx: SidebarIconRenderContext) => React.ReactNode,
  options?: Pick<SidebarStrokeIconProps, "viewBox" | "width" | "height">,
) {
  function Icon(props: SidebarIconComponentProps) {
    return (
      <SidebarStrokeIcon title={title} {...options} {...props}>
        {renderContent}
      </SidebarStrokeIcon>
    );
  }

  return Icon;
}

type SidebarFillIconProps = SidebarIconComponentProps & {
  title: string;
  width?: number;
  height?: number;
  viewBox?: string;
  pathD: string;
};

export function SidebarFillIcon({
  isActive = false,
  className = "size-6",
  color,
  title,
  width = 22,
  height = 22,
  viewBox = "0 0 22 22",
  pathD,
}: SidebarFillIconProps) {
  const iconColor = resolveSidebarIconColor(isActive, color);

  return (
    <SidebarIconFrame>
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill={iconColor}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <title>{title}</title>
        <path fillRule="evenodd" clipRule="evenodd" d={pathD} fill={iconColor} />
      </svg>
    </SidebarIconFrame>
  );
}

export function createSidebarFillIcon(
  title: string,
  pathD: string,
  options?: Pick<SidebarFillIconProps, "viewBox" | "width" | "height">,
) {
  function Icon(props: SidebarIconComponentProps) {
    return <SidebarFillIcon title={title} pathD={pathD} {...options} {...props} />;
  }

  return Icon;
}
