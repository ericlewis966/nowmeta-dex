import './smooth-button.css';

const SmoothButton = ({label, className, style, onClick}) => {
    return (
        <button className={`button-30 ${className}`} style={style} onClick={onClick} role="button">{label}</button>
    )
}

export default SmoothButton;