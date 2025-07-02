import React from "react";

interface ConfigRowProps {
  label?: string;
  stylePicker?: React.ReactNode;
  colorPicker?: React.ReactNode;
  children?: React.ReactNode;
  border?: boolean;
}

export const ConfigRow = ({ label, stylePicker, colorPicker, children, border = true }: ConfigRowProps) => (
  <div className={(border ? "border " : "") + "p-2 rounded mb-2"}>
    {label && <label className="block text-xs font-medium mb-1">{label}</label>}
    <div className="flex flex-row items-center gap-2">
      {stylePicker && <div className="flex-1">{stylePicker}</div>}
      {colorPicker && <div className="flex-1">{colorPicker}</div>}
      {children}
    </div>
  </div>
);
