import { useState } from "react";

import { ActionIcon, Badge, Center, Group, Loader, Paper, Rating, Stack, Table, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconEye, IconEyeOff, IconTrash } from "@tabler/icons";
import { type NextPage } from "next";
import { NextSeo } from "next-seo";

import { AdminLayout } from "src/components/AdminLayout";
import { api } from "src/utils/api";

const AdminReviews: NextPage = () => {
    const [actioningId, setActioningId] = useState<string | null>(null);
    const { data: reviewsData, isLoading, refetch } = api.admin.getReviews.useQuery();

    const hideReviewMutation = api.admin.hideReview.useMutation({
        onSuccess: () => {
            showNotification({
                title: "Succès",
                message: "L'avis a été masqué",
                color: "green",
                icon: <IconCheck />,
            });
            setActioningId(null);
            refetch();
        },
        onError: (error) => {
            showNotification({
                title: "Erreur",
                message: error.message,
                color: "red",
            });
            setActioningId(null);
        },
    });

    const unhideReviewMutation = api.admin.unhideReview.useMutation({
        onSuccess: () => {
            showNotification({
                title: "Succès",
                message: "L'avis a été rendu visible",
                color: "green",
                icon: <IconCheck />,
            });
            setActioningId(null);
            refetch();
        },
        onError: (error) => {
            showNotification({
                title: "Erreur",
                message: error.message,
                color: "red",
            });
            setActioningId(null);
        },
    });

    const deleteReviewMutation = api.admin.deleteReview.useMutation({
        onSuccess: () => {
            showNotification({
                title: "Succès",
                message: "L'avis a été supprimé définitivement",
                color: "green",
                icon: <IconCheck />,
            });
            setActioningId(null);
            refetch();
        },
        onError: (error) => {
            showNotification({
                title: "Erreur",
                message: error.message,
                color: "red",
            });
            setActioningId(null);
        },
    });

    const handleToggleVisibility = (reviewId: string, isCurrentlyHidden: boolean) => {
        setActioningId(reviewId);
        if (isCurrentlyHidden) {
            unhideReviewMutation.mutate({ id: reviewId });
        } else {
            hideReviewMutation.mutate({ id: reviewId });
        }
    };

    const handleDelete = (reviewId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet avis définitivement ?")) {
            setActioningId(reviewId);
            deleteReviewMutation.mutate({ id: reviewId });
        }
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
            <NextSeo title="Admin - Avis" />
            <AdminLayout>
                <Stack spacing="xl">
                    <div>
                        <Title order={1}>Avis</Title>
                        <Text color="dimmed">Modérer les avis des utilisateurs</Text>
                    </div>

                    <Paper p="md" radius="md" withBorder>
                        <Stack spacing="md">
                            <Group position="apart">
                                <Title order={3}>Tous les avis</Title>
                                <Text size="sm" color="dimmed">
                                    {reviewsData?.total ?? 0} avis
                                </Text>
                            </Group>
                            <div style={{ overflowX: "auto" }}>
                                <Table striped highlightOnHover>
                                    <thead>
                                        <tr>
                                            <th>Restaurant</th>
                                            <th>Acheteur</th>
                                            <th>Note</th>
                                            <th>Commentaire</th>
                                            <th>Date</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviewsData?.reviews.map((review) => (
                                            <tr key={review.id} style={{ opacity: review.isHidden ? 0.5 : 1 }}>
                                                <td>
                                                    <Text size="sm" weight={500}>
                                                        {review.restaurant.name}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">{review.buyerName}</Text>
                                                </td>
                                                <td>
                                                    <Rating value={review.rating} readOnly size="sm" />
                                                </td>
                                                <td>
                                                    <Text size="sm" lineClamp={2} sx={{ maxWidth: 300 }}>
                                                        {review.comment}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <Text size="sm">
                                                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                                                    </Text>
                                                </td>
                                                <td>
                                                    <Badge color={review.isHidden ? "red" : "green"} variant="filled">
                                                        {review.isHidden ? "Masqué" : "Visible"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Group spacing="xs">
                                                        <ActionIcon
                                                            color={review.isHidden ? "green" : "orange"}
                                                            variant="light"
                                                            onClick={() => handleToggleVisibility(review.id, review.isHidden)}
                                                            loading={actioningId === review.id}
                                                            title={review.isHidden ? "Rendre visible" : "Masquer"}
                                                        >
                                                            {review.isHidden ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            color="red"
                                                            variant="light"
                                                            onClick={() => handleDelete(review.id)}
                                                            loading={actioningId === review.id}
                                                            title="Supprimer définitivement"
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {reviewsData?.reviews.length === 0 && (
                                    <Center py="xl">
                                        <Text color="dimmed">Aucun avis</Text>
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
    props: { messages: (await import("src/lang/fr.json")).default },
    revalidate: 60,
});

export default AdminReviews;
