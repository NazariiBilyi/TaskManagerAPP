type DropIndicatorProps = {
    edge?: "top" | "bottom" | "right" | "left";
    gap?: string;
};

const DropIndicator = ({ edge = 'top', gap = '8px' }: DropIndicatorProps) => {
    const edgeClassMap = {
        top: "edge-top",
        bottom: "edge-bottom",
        right: "edge-right",
        left: "edge-left"
    };

    const edgeClass = edgeClassMap[edge];

    const style = {
        "gap": gap,
    };

    return <div className={`drop-indicator ${edgeClass}`} style={style}></div>;
};

export default DropIndicator;