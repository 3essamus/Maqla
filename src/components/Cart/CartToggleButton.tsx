import { ActionIcon, Badge, Indicator } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons";
import { useCart } from "src/contexts/CartContext";

interface CartToggleButtonProps {
    onOpen: () => void;
}

export function CartToggleButton({ onOpen }: CartToggleButtonProps) {
    const { getTotalItems, isEnabled } = useCart();
    const itemCount = getTotalItems();

    if (!isEnabled) return null;

    return (
        <Indicator
            color="red"
            disabled={itemCount === 0}
            label={itemCount}
            inline
            size={18}
            offset={4}
        >
            <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
                radius="xl"
                onClick={onOpen}
                title="Panier"
            >
                <IconShoppingCart size={20} />
            </ActionIcon>
        </Indicator>
    );
}
