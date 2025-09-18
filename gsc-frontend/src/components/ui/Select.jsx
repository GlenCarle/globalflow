import React, { createContext, useContext, useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const SelectContext = createContext({});

const Select = React.forwardRef(
  ({ children, value, onChange, disabled = false, placeholder, error, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
      <SelectContext.Provider
        value={{
          open,
          setOpen,
          value,
          onChange,
          disabled,
          id,
        }}
      >
        <div className="relative" ref={ref} {...props}>
          {children}
          {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, value, disabled, id } = useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      id={`${id}-trigger`}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={`${id}-content`}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
        className
      )}
      {...props}
    >
      {value || children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className, ...props }, ref) => {
  const { open, id } = useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      id={`${id}-content`}
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 text-gray-800 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
        className
      )}
      {...props}
    />
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { onChange, value: selectedValue, setOpen } = useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        onChange(value);
        setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700",
        isSelected && "bg-gray-100 dark:bg-gray-700",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectContent, SelectItem };