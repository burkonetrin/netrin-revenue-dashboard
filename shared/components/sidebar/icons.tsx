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
