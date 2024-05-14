import { icons } from "../helpers/icons";

interface SearchInputProps {
   value: string;
   onChange: (value: string) => void;
   width?: number;
   placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = (props) => {
   return (
      <div className="flex p-1 bg-white gap-2 rounded border border-gray-250 h-fit items-center">
         <input
            className="border-none outline-none text-center p-0"
            placeholder={props.placeholder || ""}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            style={{ width: props.width || 200 }}
         ></input>
         {icons.home.search}
      </div>
   );
};

export default SearchInput;
