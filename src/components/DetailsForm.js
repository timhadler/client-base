import React from "react";

export default function DetailsForm(props) {
    const customer = props.customer;

    return (
        <div className="customer_details_top">
            <div className="name-edit">
                <h2 className="customer_name"> {customer.name} </h2>
                <button className="button_main button_details_main"> Edit </button>
            </div>
            <hr className="line_header_details"/>
            <div className="details_left">
                <div className="details_group group_1">
                    <div className="detail">
                        <p className="detail_left"> Contact number </p>
                        <p className="detail_right customer_info"> {customer.contactNum} </p>
                    </div>
                    <div className="detail">
                        <p className="detail_left"> Email address </p>
                        <p className="detail_right customer_info"> {customer.eAddress} </p>
                    </div>
                    <div className="detail">
                        <p className="detail_left"> Date created </p>
                        <p className="detail_right customer_info"> {customer.created} </p>
                    </div>
                </div>
                <div className="details_group group_2">
                    <div className="detail">
                        <p className="detail_left"> Fresh air system </p>
                        <p className="detail_right customer_info"> {customer.freashAir} </p>
                    </div>
                    <div className="detail">
                        <p className="detail_left"> Customer notes: </p>
                        <p className="detail_right customer_info"> {customer.notes} </p>
                    </div>
                </div>
            </div>
            <div className="details_right">
                <div className="details_group">
                    <div className="detail">
                        <p className="detail_left"> Contact address </p>
                        <p className="detail_right customer_info"> {customer.address} </p>
                    </div>
                    <div className="detail">
                        <p className="detail_left"> Suburb </p>
                        <p className="detail_right customer_info"> {customer.suburb} </p>
                    </div>
                    <div className="detail">
                        <p className="detail_left"> City </p>
                        <p className="detail_right customer_info"> {customer.city} </p>
                    </div>
                </div>
                <div className="detail">
                        <p className="detail_right customer_info"> Photos(2) </p>
                </div>

            </div>
        </div>
    )
}