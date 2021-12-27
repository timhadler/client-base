import { useState } from "react";
import DropdownBtn from "./components/DropdownBtn";


function App() {
  return (
    <div className="App">
      <div className="App-header">
        <h1>CustomerBase</h1>
      </div>

      <div className="CustomerList">
        <DropdownBtn />
      </div>

      <div className="CustomerDetails">

      </div>

      <div className="Enquiries">

      </div>

    </div>
  );
}

export default App;
