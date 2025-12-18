import { type FC, type ReactNode, useState } from "react";

import { AppShell, Container, NavLink, Navbar, Title } from "@mantine/core";
import { IconChartBar, IconKey, IconList, IconShoppingCart, IconStar, IconUsers } from "@tabler/icons";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { NavHeader } from "../Header";

interface Props {
    children: ReactNode;
}

export const AdminLayout: FC<Props> = ({ children }) => {
    const [opened, setOpened] = useState(false);
    const router = useRouter();
    const { data: session } = useSession({ required: true });

    // Redirect if not admin
    if (session?.user?.role !== "ADMIN") {
        router.push("/");
        return null;
    }

    const navItems = [
        { label: "Tableau de bord", icon: IconChartBar, href: "/admin" },
        { label: "Clés d'activation", icon: IconKey, href: "/admin/keys" },
        { label: "Utilisateurs", icon: IconUsers, href: "/admin/users" },
        { label: "Restaurants", icon: IconShoppingCart, href: "/admin/restaurants" },
        { label: "Avis", icon: IconStar, href: "/admin/reviews" },
    ];

    return (
        <AppShell
            navbar={
                <Navbar width={{ base: 250 }} p="md" hidden={!opened} hiddenBreakpoint="sm">
                    <Navbar.Section>
                        <Title order={3} mb="md">
                            Administration
                        </Title>
                    </Navbar.Section>
                    <Navbar.Section grow>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                label={item.label}
                                icon={<item.icon size={18} />}
                                active={router.pathname === item.href}
                                onClick={() => router.push(item.href)}
                                mb="xs"
                            />
                        ))}
                    </Navbar.Section>
                </Navbar>
            }
            header={<NavHeader opened={opened} setOpened={setOpened} showInternalLinks />}
        >
            <Container size="xl" py="md">
                {children}
            </Container>
        </AppShell>
    );
};
