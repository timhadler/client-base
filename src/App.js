import { useState } from "react";


function App() {
  function dbOnClick() {
    document.getElementById("myDropdown").classList.toggle("show");
    settest("inside");
  }

  window.onclick = function(event) {
    if (!event.target.matches(".dropbtn")) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      settest("outside")
      for (i=0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.toggle("show");
        }
      }
    }
  }
  const [test, settest] = useState("default");
  return (
    <div className="App">
      <div className="App-header">
        <h1>CustomerBase</h1>
        <h1>{test}</h1>
      </div>

      <div className="CustomerList">
        <div className="dropdown">
          <button onClick={dbOnClick} className="dropbtn">Dropdown</button>
          <div id ="myDropdown" className="dropdown-content">
            <p> Item 1 </p>
            <p> Item 2 </p>
          </div>
        </div>
      </div>

      <div className="CustomerDetails">

      </div>

      <div className="Enquiries">

      </div>

    </div>
  );
}

export default App;
