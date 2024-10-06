"use client"
import {Button} from "@radix-ui/themes";
import * as RadixIcons from "@radix-ui/react-icons";
import {ActionButtonProps} from "@/app/interface/ui/button-action-interface";

export default function ActionButton({
                                         onClickAction,
                                         message,
                                         positionIcon,
                                         icon,
                                     }: ActionButtonProps) {
    const icons = {
        logout: RadixIcons.ExitIcon,
        plus: RadixIcons.PlusIcon
    }

    const IconComponent = icons[icon];

    return (
        <Button onClick={onClickAction}
                color="jade"
                variant="outline">
            {IconComponent && positionIcon === 'left' ? <IconComponent/> : ''}
            {message}
            {IconComponent && positionIcon === 'right' ? <IconComponent/> : ''}

        </Button>
    )
}