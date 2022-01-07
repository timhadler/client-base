import React from "react";

export default function DetailsForm(props) {
    const customer = props.customer;
    const appointment = props.appointments;

    return (
        <section className="customer_details">
            <div className="customer_details_top">
                <div className="header-button">
                    <h2 className="details_header"> {customer.name} </h2>
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
                            <p className="detail_left"> Address </p>
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
            <div className="customer_details_bottom">
                <div className="header-button">
                    <h2 className="details_header"> Appointments </h2>
                    <button className="button_main button_details_main"> Add Appointment </button>
                </div>
                <hr className="line_header_details"/>
                <div className="details_left">
                    <div className="details_group">
                        <div className="detail">
                            <p className="detail_left customer_info"> {appointment.dateTime} </p>
                            <button className="button_edit_appointment"> Edit </button>
                        </div>
                        <div className="detail">
                            <p className="detail_left"> {appointment.address} </p>
                        </div>
                        <div className="detail">
                            <p className="detail_left"> {appointment.service} </p>
                        </div>
                    </div>
                </div>
                <div className="details_right">
                    <div className="details_group">
                        <div className="detail">
                            <p className="detail_left"> Reminders </p>
                            <p className="detail_right customer_info"> {appointment.reminders} </p>
                        </div>
                        <div className="detail">
                            <p className="detail_left"> Next appointment </p>
                            <p className="detail_right customer_info"> {appointment.nextAppt} </p>
                        </div>
                        <div className="detail">
                            <p className="detail_left"> Notes: </p>
                            <p className="detail_right customer_info"> {appointment.notes} </p>
                        </div>
                    </div>
            </div>
            </div>
        </section>
    )
}