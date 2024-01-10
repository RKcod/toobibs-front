import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import * as  moment from 'moment';
@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {

  prescriptions: any[] = [];
  page = 1;
  total_pages = 0;
  current_page = 1;
  pageList: any[] = [];
  constructor(
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.getPrescriptions();
    console.log(this.prescriptions)
  }

  formatdate(date) {
    moment.locale('fr');
    return moment(date).format("DD MMMM YYYY, à h:mm:ss")
  }

  async getPrescriptions() {
    this.spinner.show();
    await this.apiService.performGetRequest(
      `prescriptions?include=user, doctor, prescribed&search=${ApiService.getUser().user_type == "DOCTOR" ? 'doctor_id' : 'user_id'}:${ApiService.getUser().real_id}&orderBy=id&sortedBy=desc&page=${this.page}`
    ).then((response: any) => {
      this.prescriptions = response.data
      this.total_pages = response.meta.pagination.total_pages;
      this.current_page = response.meta.pagination.current_page
      this.spinner.hide();
    }).catch(error => console.log(error));
  }

  gotoPage(page: number) {
    this.page = page;
    if (this.page == 0) {
      this.page = 1
    }
    this.getPrescriptions();
  }

  previousPage() {
    this.page = this.page - 1;
    if (this.page == 0) {
      this.page = 1
    }
    this.getPrescriptions();
  }

  nextPage() {
    this.page = this.page + 1;
    if (this.page == 0) {
      this.page = 1
    }
    this.getPrescriptions();
  }

  getPages() {
    let arr: any[] = []
    for (let i = 1; i <= this.total_pages; i++) {
      arr.push(i)
    }
    return arr;
  }

  deletePrescription(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette prescription ?")) {
      this.apiService.performDELETECall("prescriptions/" + id, true).subscribe(res => {
        this.apiService.displayMessage("Succès", "prescription supprimée avec succès");
        this.ngOnInit();
      }, err => {
        this.apiService.handleErrors(err.error.message);
      });
    }
  }

}
