import { ActionIcon, Box, Button, Divider, Drawer, Group, NumberInput, Stack, Text, Title } from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons";
import { useCart } from "src/contexts/CartContext";

interface CartDrawerProps {
    opened: boolean;
    onClose: () => void;
}

export function CartDrawer({ opened, onClose }: CartDrawerProps) {
    const { items, restaurant, removeItem, updateQuantity, clearCart, getSubtotal, getTotal } = useCart();

    const handleWhatsAppOrder = () => {
        if (!restaurant || items.length === 0) return;

        const itemsList = items
            .map((item) => `- ${item.name} x${item.quantity} (${item.price * item.quantity} DZD)`)
            .join("\n");

        const subtotal = getSubtotal();
        const deliveryFee = restaurant.deliveryFee ?? 0;
        const total = getTotal();

        const message = `
🍴 Nouvelle commande de ${restaurant.name}

📋 Articles:
${itemsList}

💰 Sous-total: ${subtotal} DZD
${deliveryFee > 0 ? `🚚 Livraison: ${deliveryFee} DZD\n` : ""}✅ Total: ${total} DZD

Merci!
        `.trim();

        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = restaurant.whatsappNumber?.replace(/[^0-9]/g, "") ?? "";
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        window.open(url, "_blank");

        // Clear cart after order
        clearCart();
        onClose();
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={<Title order={3}>Panier</Title>}
            position="right"
            size="md"
            padding="md"
        >
            {items.length === 0 ? (
                <Text align="center" color="dimmed" mt="xl">
                    Votre panier est vide
                </Text>
            ) : (
                <Stack spacing="md">
                    <Stack spacing="sm">
                        {items.map((item) => (
                            <Box key={item.menuItemId}>
                                <Group position="apart" align="start">
                                    <Box sx={{ flex: 1 }}>
                                        <Text weight={500}>{item.name}</Text>
                                        <Text size="sm" color="dimmed">
                                            {item.price} DZD
                                        </Text>
                                    </Box>

                                    <Group spacing="xs">
                                        <ActionIcon
                                            size="sm"
                                            variant="light"
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                        >
                                            <IconMinus size={14} />
                                        </ActionIcon>

                                        <Text weight={500} sx={{ minWidth: 30, textAlign: "center" }}>
                                            {item.quantity}
                                        </Text>

                                        <ActionIcon
                                            size="sm"
                                            variant="light"
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                        >
                                            <IconPlus size={14} />
                                        </ActionIcon>

                                        <ActionIcon
                                            size="sm"
                                            variant="light"
                                            color="red"
                                            onClick={() => removeItem(item.menuItemId)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Group>

                                <Text align="right" size="sm" weight={600} mt={4}>
                                    {item.price * item.quantity} DZD
                                </Text>

                                <Divider my="xs" />
                            </Box>
                        ))}
                    </Stack>

                    <Box>
                        <Group position="apart">
                            <Text>Sous-total:</Text>
                            <Text weight={600}>{getSubtotal()} DZD</Text>
                        </Group>

                        {restaurant?.deliveryFee && restaurant.deliveryFee > 0 && (
                            <Group position="apart" mt="xs">
                                <Text>Frais de livraison:</Text>
                                <Text weight={600}>{restaurant.deliveryFee} DZD</Text>
                            </Group>
                        )}

                        <Divider my="sm" />

                        <Group position="apart">
                            <Text size="lg" weight={700}>
                                Total:
                            </Text>
                            <Text size="lg" weight={700} color="blue">
                                {getTotal()} DZD
                            </Text>
                        </Group>
                    </Box>

                    <Stack spacing="xs">
                        <Button
                            fullWidth
                            size="lg"
                            onClick={handleWhatsAppOrder}
                            disabled={!restaurant?.whatsappNumber}
                        >
                            Commander via WhatsApp
                        </Button>

                        <Button fullWidth variant="subtle" color="red" onClick={clearCart}>
                            Vider le panier
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Drawer>
    );
}
