export interface ActionButtonProps {
    onClickAction: () => void;
    message: string;
    positionIcon: 'right' | 'left';
    color: "gray" | "gold" | "bronze" | "brown" | "yellow" | "amber" | "orange" | "tomato" | "red" | "ruby" | "crimson" | "pink" | "plum" | "purple" | "violet" | "iris" | "indigo" | "blue" | "cyan" | "teal" | "jade" | "green" | "grass" | "lime" | "mint" | "sky";
    icon?: string;

}