import React from "react";
import ReactDom from "react-dom";

import { Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink } from 'reactstrap';

export default class Header extends React.Component {
  constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
		  dropdownOpen: false
		};
	}

	toggle = () => {
		this.setState({
		  dropdownOpen: !this.state.dropdownOpen
		});
	}


	render() {
		return (
			<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
			  <a class="navbar-brand" href="#">Lightning Futures Exchange</a>
			  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			    <span class="navbar-toggler-icon"></span>
			  </button>

			  <div class="collapse navbar-collapse" id="navbarSupportedContent">
			    <ul class="navbar-nav ml-auto">
			      <li class="nav-item dropdown">
			        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			          Manage
			        </a>
			        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
			          <a class="dropdown-item" href="#">Wallets</a>
			          <a class="dropdown-item" href="#">Exchanges</a>
			          <a class="dropdown-item" href="#">Accounts</a>
			        </div>
			      </li>
			    </ul>
			  </div>
			</nav>
		);
	}
}