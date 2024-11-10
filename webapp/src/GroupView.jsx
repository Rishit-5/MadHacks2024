import React from "react";
import "./index.css";
import { TransactionContainer } from "./TransactionContainer";
import Calculator from "./Calculator";

const GroupView = (props) => {

  return (
    <div className="flex flex-col">
      <div className="title-section w-full h-[100px] flex flex-col justify-center rounded-2xl shadow-lg select-none">
        <h1 className="font-bold custom-heading text-[30px] text-white text-center">
          GROUP VIEW
        </h1>
      </div>
      {/* <TransactionContainer/> */}
      <Calculator/>
      
    </div>
  );
};

export default GroupView;
