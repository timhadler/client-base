import { useState } from "react";
import user_icon from "./images/user-icon.png";
import DropdownBtn from "./components/DropdownBtn";



function App() {
  const CUSTOMER_DATA = [
    { id: "1", name: "Anne Barron", contactNum: "021 8456 258", eAddress: "anne@Barron.co.nz", created: "30/12/2021",  freashAir: "Hrv Gen 1", address: "14 Burwood Rd", suburb: "Burwood", city: "Christchurch", pc: 8043, notes:""},
    { id: "2", name: "Barry Stansfield", contactNum: "021 6754 890", eAddress: "barry@stansfield.co.nz", created: "15/2/2021",  freashAir: "Hrv Gen 2", address: "18 Everness Ln", suburb: "Addington", city: "Christchurch", pc: 8045, notes:""}
  ];

  const APPOINTMENT_DATA = [
    {id: "ap_1", dateTime: "Wed, 4 Aug, 9:00am", address: "14 Burwood Rd, Burwood, Christchurch", service: "2x Premium heatpump cleans", reminders: "Yearly", nextAppt: "4 Aug 2022", notes: ""}
  ]

  const [customers, setCustomers] = useState(CUSTOMER_DATA);
  const customerList = [];
  var i;

  customerList[0] = <li key={customers[0].id} onClick={myFunction1}> {customers[0].name} </li>;
  customerList[1] = <li key={customers[1].id} onClick={myFunction2}> {customers[1].name} </li>;

  var [testCustomer, setCustomer] = useState(CUSTOMER_DATA[0]);

  function myFunction1() {
    setCustomer(CUSTOMER_DATA[0]);
  }
  function myFunction2() {
    setCustomer(CUSTOMER_DATA[1]);
  }
  return (
    <div className="App">
      <main>
        <header>
          <nav>
            <h1 className="logo_font"> CustomerBase </h1>
            <div className="page_links">
              <a href="#">Calender</a>
              <a href="#">Customer</a>
            </div>
            <img className="logo_user" src={user_icon}/>
            <DropdownBtn text="WEST" />
          </nav>
          <hr className="line_under line_customer"/>
        </header>
        <hr className="line_header"/>
        <section className="customer_list">
          <div className="customer_list_top">
            <button className="button_main button_add_customer"> Add&nbsp;Customer </button>
            <form>
              <input type="text" className="search_bar" autoComplete="off" defaultValue="Search..." />
            </form>
          </div>
          <div className="customer_list_top">
            <p className="customer_count"> 47&nbsp;customers </p>
            <button className="button_main button_filter"> Filter </button>
          </div>
          <hr className="line_list"/>
          <ul className="customerList">
            {customerList}

          </ul>
        </section>
        <DetailsForm customer={testCustomer} appointments={APPOINTMENT_DATA[0]}/>
      </main>
    </div>
  );
}

export default App;
