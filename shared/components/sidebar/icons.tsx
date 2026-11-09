import {
  createSidebarStrokeIcon,
  sidebarStroke,
} from "./iconColor.utils";

export const CustomersIcon = createSidebarStrokeIcon(
  "Customers icon",
  ({ iconColor }) => (
    <>
      <circle cx="17" cy="17" r="2" {...sidebarStroke(iconColor)} />
      <path
        d="M21 23C21 24.1046 21 25 17 25C13 25 13 24.1046 13 23C13 21.8954 14.7909 21 17 21C19.2091 21 21 21.8954 21 23Z"
        {...sidebarStroke(iconColor)}
      />
      <path
        d="M10 20C10 16.2288 10 14.3431 11.1716 13.1716C12.3431 12 14.2288 12 18 12H22C25.7712 12 27.6569 12 28.8284 13.1716C30 14.3431 30 16.2288 30 20C30 23.7712 30 25.6569 28.8284 26.8284C27.6569 28 25.7712 28 22 28H18C14.2288 28 12.3431 28 11.1716 26.8284C10 25.6569 10 23.7712 10 20Z"
        {...sidebarStroke(iconColor)}
      />
      <path
        d="M27 20H23"
        {...sidebarStroke(iconColor, { strokeLinecap: "round" })}
      />
      <path
        d="M27 17H22"
        {...sidebarStroke(iconColor, { strokeLinecap: "round" })}
      />
      <path
        d="M27 23H24"
        {...sidebarStroke(iconColor, { strokeLinecap: "round" })}
      />
    </>
  ),
  { viewBox: "8 12 24 16" },
);

export const FinancialIcon = createSidebarStrokeIcon("Financial icon", ({ iconColor }) => (
  <>
    <circle cx="12" cy="12" r="10" {...sidebarStroke(iconColor)} />
    <path d="M12 17V17.5V18" {...sidebarStroke(iconColor, { strokeLinecap: "round" })} />
    <path d="M12 6V6.5V7" {...sidebarStroke(iconColor, { strokeLinecap: "round" })} />
    <path
      d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5"
      {...sidebarStroke(iconColor, { strokeLinecap: "round" })}
    />
  </>
));

export const SettingsIcon = createSidebarStrokeIcon("Settings icon", ({ iconColor }) => (
  <>
    <circle cx="12" cy="12" r="3" {...sidebarStroke(iconColor)} />
    <path
      d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
      {...sidebarStroke(iconColor, { strokeLinecap: "round" })}
    />
  </>
));

export const DataSourcesIcon = createSidebarStrokeIcon("Data sources icon", ({ iconColor }) => (
  <>
    <path d="M8 8H16V16H8V8Z" {...sidebarStroke(iconColor)} />
    <path
      d="M16 16.001L19 16.0005C20.6569 16.0002 22.0002 17.3432 22.0005 19C22.0007 20.6569 20.6578 22.0002 19.0009 22.0005C17.3441 22.0007 16.0007 20.6578 16.0005 19.001L16 16.001Z"
      {...sidebarStroke(iconColor)}
    />
    <path
      d="M8.00098 16.001L5.00098 16.0005C3.34412 16.0002 2.00076 17.3432 2.0005 19C2.00024 20.6569 3.34318 22.0002 5.00003 22.0005C6.65689 22.0007 8.00024 20.6578 8.0005 19.001L8.00098 16.001Z"
      {...sidebarStroke(iconColor)}
    />
    <path
      d="M16 8.00002L19 8.00049C20.6569 8.00075 22.0002 6.65781 22.0005 5.00096C22.0007 3.34411 20.6578 2.00075 19.0009 2.00049C17.3441 2.00023 16.0007 3.34316 16.0005 5.00002L16 8.00002Z"
      {...sidebarStroke(iconColor)}
    />
    <path
      d="M8.00098 8.00002L5.00098 8.00049C3.34412 8.00075 2.00076 6.65781 2.0005 5.00096C2.00024 3.34411 3.34318 2.00075 5.00003 2.00049C6.65689 2.00023 8.00024 3.34316 8.0005 5.00002L8.00098 8.00002Z"
      {...sidebarStroke(iconColor)}
    />
  </>
));

export const ProvidersIcon = createSidebarStrokeIcon("Providers icon", ({ iconColor }) => (
  <>
    <path
      d="M4 8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8Z"
      {...sidebarStroke(iconColor)}
    />
    <path
      d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
      {...sidebarStroke(iconColor)}
    />
    <path d="M8 7H16" {...sidebarStroke(iconColor, { strokeLinecap: "round" })} />
    <path d="M8 10.5H13" {...sidebarStroke(iconColor, { strokeLinecap: "round" })} />
  </>
));

export const SearchIcon = createSidebarStrokeIcon("Search icon", ({ iconColor }) => (
  <>
    <circle cx="11" cy="11" r="7" {...sidebarStroke(iconColor)} />
    <path d="m16 16 5 5" {...sidebarStroke(iconColor, { strokeLinecap: "round" })} />
  </>
));
