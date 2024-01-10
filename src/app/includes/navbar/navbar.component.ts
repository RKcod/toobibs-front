import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../api/api.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public isCollapsed = true;

  active_menu = "";
  user:any = null;//ApiService.getUser();
  constructor(public api: ApiService, private router: Router) {
    if(this.router.url == "/appointments"){
      this.active_menu = "appointments";
    }
    else if(this.router.url == "/planning"){
      this.active_menu = "planning";
    }
    else if(this.router.url == "/availabilities"){
      this.active_menu = "availabilities";
    }
    else if(this.router.url == "/documents"){
      this.active_menu = "documents";
    }
    else if(this.router.url == "/prescriptions"){
      this.active_menu = "prescriptions";
    }
    else if(this.router.url == "/relaunch"){
      this.active_menu = "relaunch";
    }
    else if(this.router.url == "/patient-list"){
      this.active_menu = "patient-list";
    }
  }

  ngOnInit(): void {
   this.user  = ApiService.getUser();
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("token_data");
    localStorage.removeItem("user");
    localStorage.removeItem("rates");
    localStorage.removeItem("expires");
    localStorage.removeItem("call");
    this.router.navigate(["/login"]);
  }
}
