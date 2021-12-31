import React from "react";

export default function DropdownBtn(props) {
    // Show dropdown content
    function dbOnClick() {
        document.getElementById("myDropdown").classList.toggle("show");
      }
      
      // Hide dropdown content when clicked outside of dropdown button
      window.onclick = function(event) {
        if (!event.target.matches(".dropbtn")) {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          var i;
          for (i=0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
              openDropdown.classList.toggle("show");
            }
          }
        }
      }
    
    return (
        <div className="dropdown">
          <button onClick={dbOnClick} className="dropbtn">{props.text}</button>
          <div id ="myDropdown" className="dropdown-content">
            {props.items}
          </div>
      </div>
    );
}