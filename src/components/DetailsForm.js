import React from "react";

export default function DetailsForm(props) {
    return (
        <div className="customer_detail_top">
            <h2 className="customer_name"> {props.name} </h2>
            <button className="button_main"> Edit </button>
        </div>
    )
}