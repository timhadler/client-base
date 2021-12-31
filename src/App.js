import { useState } from "react";
import user_icon from "./images/user-icon.png";
import DropdownBtn from "./components/DropdownBtn";


function App() {
  const login_dropdown_items = [
    /*<a href="#"> Info </a>,
    <a href="#"> Logout </a>*/
  ];

  const CUSTOMER_DATA = [
    { id: "1", name: "Anne Barron", contactNum: "0278135441", created: "30/12/2021",  freashAir: "Hrv Gen 1", address: "14 Burwood Rd", suburb: "Burwood", city: "Christchurch", pc: 8043},
    { id: "2", name: "Barry Stansfield", contactNum: "0278135441", created: "30/12/2021",  freashAir: "Hrv Gen 1", address: "14 Burwood Rd", suburb: "Burwood", city: "Christchurch", pc: 8043}
  ];

  const [customers, setCustomers] = useState(CUSTOMER_DATA);
  const customerList = [];
  var i;
  for (i = 0; i < customers.length; i++) {
    customerList[i] = <li> {customers[i].name} </li>;
  }
  console.log(customerList);

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
            <DropdownBtn text="WEST" items={login_dropdown_items} />
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
          <hr />
          <ul className="customers">
            {customerList}

          </ul>
        </section>
      </main>

    </div>
  );
}

export default App;
