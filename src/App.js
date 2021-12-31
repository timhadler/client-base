import { useState } from "react";
import user_icon from "./images/user-icon.png";
import DropdownBtn from "./components/DropdownBtn";


function App() {
  const login_dropdown_items = [
    <a href="#"> Info </a>,
    <a href="#"> Logout </a>
  ];
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
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
            <li> Anne Barron </li>
            <li> Barry Stansfield </li>
            <li> Darren Buxley </li>
            <li> Charlie Wort </li>
          </ul>
        </section>
      </main>

    </div>
  );
}

export default App;
