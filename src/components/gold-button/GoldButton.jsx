import './gold-button.css';

const GoldButton = ({label, style, className, onClick}) => {
    return (
        <button className={`button-49 ${className}`} style={style} onClick={onClick} role="button">{label}</button>
    )
}

export default GoldButton;