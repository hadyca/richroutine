import {
  AudioWaveformIcon,
  BookOpenIcon,
  BotIcon,
  BriefcaseIcon,
  BuildingIcon,
  CommandIcon,
  CreditCardIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  HeartHandshakeIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  LineChartIcon,
  MapIcon,
  MegaphoneIcon,
  NewspaperIcon,
  PieChartIcon,
  RocketIcon,
  Settings2Icon,
  SettingsIcon,
  SquareTerminalIcon,
  Target,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "~/core/components/ui/sidebar";

import SidebarMain from "./sidebar-main";
import SidebarProjects from "./sidebar-projects";
import SidebarUser from "./sidebar-user";

const data = {
  teams: [
    {
      name: "하하",
      logo: BuildingIcon,
      plan: "hohoho",
    },
    {
      name: "TechCo Solutions",
      logo: BriefcaseIcon,
      plan: "Startup",
    },
    {
      name: "GrowthMate",
      logo: RocketIcon,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      icon: UsersIcon,
      items: [
        {
          title: "Contacts",
          url: "#",
        },
        {
          title: "Companies",
          url: "#",
        },
        {
          title: "Deals",
          url: "#",
        },
      ],
    },
    {
      title: "Sales",
      url: "#",
      icon: LineChartIcon,
      items: [
        {
          title: "Pipeline",
          url: "#",
        },
        {
          title: "Opportunities",
          url: "#",
        },
        {
          title: "Quotes",
          url: "#",
        },
        {
          title: "Invoices",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2Icon,
      items: [
        {
          title: "Workspace",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Integrations",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "대시보드",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      name: "미국 증시 뉴스",
      url: "/dashboard/news/us-stocks",
      icon: NewspaperIcon,
      disabled: false,
    },
    {
      name: "국내 증시 뉴스",
      url: "/dashboard/news/kr-stocks",
      icon: NewspaperIcon,
      disabled: false,
    },
    // {
    //   name: "뉴스 기록",
    //   url: "/dashboard/news-history",
    //   icon: HistoryIcon,
    // },
    // {
    //   name: "결제내역",
    //   url: "/dashboard/payments",
    //   icon: CreditCardIcon,
    //   disabled: true,
    // },
    {
      name: "계정",
      url: "/account/edit",
      icon: UserIcon,
    },
  ],
};

export default function DashboardSidebar({
  user,
  subscriptionType,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  subscriptionType: string;
}) {
  const { setOpenMobile } = useSidebar();
  const location = useLocation();

  React.useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader className="ml-2 h-16 justify-center">
        <Link to="/" className="w-fit" onClick={() => setOpenMobile(false)}>
          <h1 className="text-lg font-extrabold">RichRoutine</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* <SidebarMain items={data.navMain} /> */}
        <SidebarProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser
          user={{
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          }}
          subscriptionType={subscriptionType}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
