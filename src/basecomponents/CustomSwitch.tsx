interface CustomSwitchProps {
   checked: boolean;
   disabled?: boolean;
   onChange: (checked: boolean) => void;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
   checked,
   onChange,
   disabled = false,
}) => {
   return (
      <input
         type="checkbox"
         disabled={disabled}
         checked={checked}
         onChange={(e) => onChange(e.target.checked)}
      ></input>
   );
};

export default CustomSwitch;
