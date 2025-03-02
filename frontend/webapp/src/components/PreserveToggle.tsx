"use client";

import React from "react";
import { Switch } from "./ui/Switch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

type PreserveToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const PreserveToggle: React.FC<PreserveToggleProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <div className="flex items-center">
      <Switch
        checked={checked}
        onCheckedChange={(checkedValue) => onChange(checkedValue as boolean)}
        className="mr-2"
        disabled={disabled}
      />
      <span className="text-sm font-medium text-gray-200 flex items-center">
        Preserve existing pairs
        <div className="relative group ml-0.5 inline-flex items-center">
          <FontAwesomeIcon
            icon={faQuestionCircle}
            className="w-3 h-3 text-gray-400 hover:text-gray-300 cursor-pointer"
          />
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-[#2f2f2f] text-xs p-2 rounded shadow-lg w-72">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-1 border-r border-gray-600 pr-2">
                <div className="font-semibold mb-1">Enabled</div>
                <div>Appends new pairs to your current deck without changing existing ones.</div>
              </div>
              <div className="col-span-1 pl-2">
                <div className="font-semibold mb-1">Disabled</div>
                <div>Replaces existing pairs with refined pairs.</div>
              </div>
            </div>
          </div>
        </div>
      </span>
    </div>
  );
};

export { PreserveToggle }; 