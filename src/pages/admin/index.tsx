import { Box, Center, Grid, Loader, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconKey, IconShoppingCart, IconStar, IconUsers } from "@tabler/icons";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";

import { AdminLayout } from "src/components/AdminLayout";
import { api } from "src/utils/api";

const AdminDashboard: NextPage = () => {
    const { data: stats, isLoading } = api.admin.getStats.useQuery();

    if (isLoading) {
        return (
            <AdminLayout>
                <Center h="50vh">
                    <Loader size="lg" />
                </Center>
            </AdminLayout>
        );
    }

    const statCards = [
        {
            title: "Utilisateurs",
            value: stats?.totalUsers ?? 0,
            icon: IconUsers,
            color: "blue",
        },
        {
            title: "Restaurants",
            value: stats?.totalRestaurants ?? 0,
            subtitle: `${stats?.publishedRestaurants ?? 0} publiés`,
            icon: IconShoppingCart,
            color: "green",
        },
        {
            title: "Clés d'activation",
            value: stats?.totalKeys ?? 0,
            subtitle: `${stats?.usedKeys ?? 0} utilisées, ${stats?.unusedKeys ?? 0} disponibles`,
            icon: IconKey,
            color: "orange",
        },
        {
            title: "Avis",
            value: stats?.totalReviews ?? 0,
            icon: IconStar,
            color: "yellow",
        },
    ];

    return (
        <>
            <NextSeo title="Admin - Tableau de bord" />
            <AdminLayout>
                <Stack spacing="xl">
                    <div>
                        <Title order={1}>Tableau de bord</Title>
                        <Text color="dimmed">Vue d'ensemble de la plateforme Maqla</Text>
                    </div>

                    <SimpleGrid
                        cols={4}
                        breakpoints={[
                            { maxWidth: "lg", cols: 2 },
                            { maxWidth: "sm", cols: 1 },
                        ]}
                    >
                        {statCards.map((card) => (
                            <Paper key={card.title} p="md" radius="md" withBorder>
                                <Stack spacing="xs">
                                    <Box
                                        sx={(theme) => ({
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        })}
                                    >
                                        <Text size="sm" color="dimmed" weight={500}>
                                            {card.title}
                                        </Text>
                                        <card.icon size={20} color={card.color} />
                                    </Box>
                                    <Text size="xl" weight={700}>
                                        {card.value}
                                    </Text>
                                    {card.subtitle && (
                                        <Text size="xs" color="dimmed">
                                            {card.subtitle}
                                        </Text>
                                    )}
                                </Stack>
                            </Paper>
                        ))}
                    </SimpleGrid>

                    <Grid>
                        <Grid.Col span={12}>
                            <Paper p="md" radius="md" withBorder>
                                <Stack spacing="md">
                                    <Title order={3}>Actions rapides</Title>
                                    <SimpleGrid cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
                                        <Paper
                                            p="md"
                                            withBorder
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => (window.location.href = "/admin/keys")}
                                        >
                                            <Stack spacing="xs">
                                                <IconKey size={24} />
                                                <Text weight={600}>Générer une clé</Text>
                                                <Text size="sm" color="dimmed">
                                                    Créer une nouvelle clé d'activation
                                                </Text>
                                            </Stack>
                                        </Paper>
                                        <Paper
                                            p="md"
                                            withBorder
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => (window.location.href = "/admin/restaurants")}
                                        >
                                            <Stack spacing="xs">
                                                <IconShoppingCart size={24} />
                                                <Text weight={600}>Modérer les restaurants</Text>
                                                <Text size="sm" color="dimmed">
                                                    Publier ou masquer des restaurants
                                                </Text>
                                            </Stack>
                                        </Paper>
                                    </SimpleGrid>
                                </Stack>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </AdminLayout>
        </>
    );
};

export const getStaticProps = async () => ({
    props: { messages: (await import("src/lang/en.json")).default },
    revalidate: 60,
});

export default AdminDashboard;
