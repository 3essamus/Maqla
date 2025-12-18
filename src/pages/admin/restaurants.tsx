import { useState } from "react";

import { ActionIcon, Badge, Button, Center, Group, Loader, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconEye, IconEyeOff } from "@tabler/icons";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";

import { AdminLayout } from "src/components/AdminLayout";
import { api } from "src/utils/api";

const AdminRestaurants: NextPage = () => {
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const { data: restaurantsData, isLoading, refetch } = api.admin.getAllRestaurants.useQuery();

    const togglePublishedMutation = api.admin.toggleRestaurantPublished.useMutation({
        onSuccess: () => {
            showNotification({
                title: "Succès",
                message: "Le statut du restaurant a été mis à jour",
                color: "green",
                icon: <IconCheck />,
            });
            setTogglingId(null);
            refetch();
        },
        onError: (error) => {
            showNotification({
                title: "Erreur",
                message: error.message,
                color: "red",
            });
            setTogglingId(null);
        },
    });

    const handleTogglePublished = (restaurantId: string, userId: string, currentStatus: boolean) => {
        setTogglingId(restaurantId);
        togglePublishedMutation.mutate({
            restaurantId,
            userId,
            isPublished: !currentStatus,
        });
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <Center h="50vh">
                    <Loader size="lg" />
                </Center>
            </AdminLayout>
        );
    }

    return (
        <>
            <NextSeo title="Admin - Restaurants" />
            <AdminLayout>
                <Stack spacing="xl">
                    <div>
                        <Title order={1}>Restaurants</Title>
                        <Text color="dimmed">Modérer les restaurants de la plateforme</Text>
                    </div>

                    <Paper p="md" radius="md" withBorder>
                        <Stack spacing="md">
                            <Group position="apart">
                                <Title order={3}>Tous les restaurants</Title>
                                <Text size="sm" color="dimmed">
                                    {restaurantsData?.total ?? 0} restaurant(s)
                                </Text>
                            </Group>
                            <div style={{ overflowX: "auto" }}>
                                <Table striped highlightOnHover>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Propriétaire</th>
                                            <th>Localisation</th>
                                            <th>Forfait</th>
                                            <th>Menus</th>
                                            <th>Avis</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {restaurantsData?.restaurants.map((restaurant) => (
                                            <tr key={restaurant.id}>
                                                <td>
                                                    <Text size="sm" weight={500}>
                                                        {restaurant.name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">{restaurant.user.email}</Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">{restaurant.location}</Text>
                                                </td>
                                                <td>
                                                    <Badge
                                                        color={restaurant.user.tier === "PAID" ? "yellow" : "gray"}
                                                        size="sm"
                                                    >
                                                        {restaurant.user.tier === "PAID" ? "Payant" : "Gratuit"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Text size="sm">{restaurant._count.menus}</Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">{restaurant._count.reviews}</Text>
                                                </td>
                                                <td>
                                                    <Badge color={restaurant.isPublished ? "green" : "gray"} variant="filled">
                                                        {restaurant.isPublished ? "Publié" : "Non publié"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Group spacing="xs">
                                                        <ActionIcon
                                                            color={restaurant.isPublished ? "red" : "green"}
                                                            variant="light"
                                                            onClick={() =>
                                                                handleTogglePublished(
                                                                    restaurant.id,
                                                                    restaurant.userId,
                                                                    restaurant.isPublished
                                                                )
                                                            }
                                                            loading={togglingId === restaurant.id}
                                                        >
                                                            {restaurant.isPublished ? (
                                                                <IconEyeOff size={16} />
                                                            ) : (
                                                                <IconEye size={16} />
                                                            )}
                                                        </ActionIcon>
                                                        <Button
                                                            size="xs"
                                                            variant="subtle"
                                                            onClick={() =>
                                                                window.open(`/restaurant/${restaurant.id}/menu`, "_blank")
                                                            }
                                                        >
                                                            Voir
                                                        </Button>
                                                    </Group>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {restaurantsData?.restaurants.length === 0 && (
                                    <Center py="xl">
                                        <Text color="dimmed">Aucun restaurant</Text>
                                    </Center>
                                )}
                            </div>
                        </Stack>
                    </Paper>
                </Stack>
            </AdminLayout>
        </>
    );
};

export const getStaticProps = async () => ({
    props: { messages: (await import("src/lang/en.json")).default },
    revalidate: 60,
});

export default AdminRestaurants;
