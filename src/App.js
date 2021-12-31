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
            <DropdownBtn text="WEST" items={login_dropdown_items}></DropdownBtn>
          </nav>
          <hr className="line_under line_customer"/>
        </header>
        <hr className="line_header"/>
      </main>

    </div>
  );
}

export default App;
