import { Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/api/api.service';
export interface PeriodicElement {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}


@Component({
  selector: 'app-patient-record',
  templateUrl: './patient-record.component.html',
  styleUrls: ['./patient-record.component.scss']
})
export class PatientRecordComponent implements OnInit {
  @ViewChild('modalContent') modalContent: any;
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

 
  patientName: string = '';
  patientNumber: string = '';
  date: string = '';
  address: string = '';
  nom :string;
  dataSource:PeriodicElement[]=[];
  constructor(
    private router:Router, 
    private modalService:NgbModal,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    ){}

  
  ngOnInit(): void {
    this.getPatientDoctor();
  }
 

  openModal() {
    this.modalService.open(this.modalContent);
  }

  consultPatient(name){
    this.router.navigateByUrl('/patient-menu');
  }

  async getPatientDoctor() {
    this.spinner.show();
    try {
      const response: any = await this.apiService.performGetRequest(
        `patient-doctor?doctorId=${ApiService.getUser().real_id}`
      );
  
      this.dataSource = response;
      this.spinner.hide();
    } catch (error) {
      console.log(error);
    }
  }


  async rechercherPatients() {
    this.spinner.show();
    try {
      let queryParams = `patient-doctor?doctorId=${ApiService.getUser().real_id}`;
  
      if (this.nom) {
        queryParams += `&name=${this.nom}`;
      }
  
      const response: any = await this.apiService.performGetRequest(queryParams);
  
      this.dataSource = response;
  
      this.spinner.hide();
    } catch (error) {
      console.log(error);
    }
  }

  refresh(){
    this.nom ="";
  }




}
