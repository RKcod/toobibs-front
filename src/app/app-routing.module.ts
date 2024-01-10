import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {LoginComponent} from "./pages/login/login.component";
import {RegisterUserComponent} from "./pages/register-user/register-user.component";
import {RegisterDoctorComponent} from "./pages/register-doctor/register-doctor.component";
import {HelpComponent} from "./pages/help/help.component";
import {SettingsComponent} from "./pages/settings/settings.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {AddMetaComponent} from "./pages/add-meta/add-meta.component";
import {SearchResultsComponent} from "./pages/search-results/search-results.component";
import {DocumentsComponent} from "./pages/documents/documents.component";
import {BookAppointmentComponent} from "./pages/book-appointment/book-appointment.component";
import {AppointmentsComponent} from "./pages/appointments/appointments.component";
import { SetCalendarComponent } from './pages/set-calendar/set-calendar.component';
import {CalendarComponent} from "./pages/calendar/calendar.component";
import {PaymentComponent} from "./pages/payment/payment.component";
import {DoctorRegisteredComponent} from "./pages/doctor-registered/doctor-registered.component";
import {AppointmentSentComponent} from "./pages/appointment-sent/appointment-sent.component";
import {PaymentMethodsComponent} from "./pages/payment-methods/payment-methods.component";
import {EditProfileComponent} from "./pages/profile/edit-profile/edit-profile.component";
import {PasswordResetComponent} from "./pages/password-reset/password-reset.component";
import {ChangePasswordComponent} from "./pages/change-password/change-password.component";
import {AboutUsComponent} from "./pages/about-us/about-us.component";
import {MediaComponent} from "./pages/media/media.component";
import {CarreersComponent} from "./pages/carreers/carreers.component";
import {ConfirmAccountComponent} from "./pages/confirm-account/confirm-account.component";
import {ChangePasswordPhoneComponent} from "./pages/change-password-phone/change-password-phone.component";
import {PrescriptionComponent} from './pages/prescription/prescription.component';
import {MakePrescriptionComponent} from './pages/prescription/make-prescription/make-prescription.component';
import {PrescriptionDetailComponent} from './pages/prescription/prescription-detail/prescription-detail.component';
import { RelaunchComponent } from './pages/relaunch/relaunch.component';
import { PatientRecordComponent } from './pages/patient-record/patient-record.component';
import { PatientMenuComponent } from './pages/patient-record/patient-menu/patient-menu.component';
import { ListPrescriptionComponent } from './pages/prescription/list-prescription/list-prescription.component';


const routes: Routes = [
  {
    redirectTo: "/home",
    path: "",
    pathMatch: 'full'
  },
  {
    path: "home",
    component: HomeComponent
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "register",
    component: RegisterUserComponent
  },
  {
    path: "register-pro",
    component: RegisterDoctorComponent
  },
  {
    path: "help",
    component: HelpComponent
  }

  ,
  {
    path: "settings",
    component: SettingsComponent
  },
  {
    path: "availabilities",
    component: SetCalendarComponent
  },

  {
    path: "relaunch",
    component: RelaunchComponent
  },

  {
    path: "patient-list",
    component: PatientRecordComponent
  },

  {
    path: "patient-menu/:id",
    component: PatientMenuComponent
  },
  {
    path: "planning",
    component: CalendarComponent
  },
  {
    path: "profile/:id",
    component: ProfileComponent
  },
  {
    path: "prescriptions",
    component: PrescriptionComponent,
  },
  {
    path: "make-prescription",
    component: MakePrescriptionComponent,
  },

  {
    path: "list-prescription",
    component: ListPrescriptionComponent,
  },
  {
    path: "prescription-detail/:id",
    component: PrescriptionDetailComponent,
  },
  {
    path: "add-docs",
    component: AddMetaComponent
  },
  {
    path: "results",
    component: SearchResultsComponent
  },
  {
    path: "documents",
    component: DocumentsComponent
  },
  {
    path: "book-appointment/:id",
    component: BookAppointmentComponent
  },
  {
    path: "appointments",
    component: CalendarComponent
  },
  {
    path: "appointment-sent",
    component: AppointmentSentComponent
  },
  {
    path: "payment/:id",
    component: PaymentComponent
  },
  {
    path: "registered",
    component: DoctorRegisteredComponent
  },
  {
    path: "edit-profile",
    component: EditProfileComponent
  },
  {
    path: "payment-methods/:id",
    component: PaymentMethodsComponent
  },
  {
    path: "forgot-password",
    component: PasswordResetComponent
  },
  {
    path: "password-reset",
    component: ChangePasswordComponent
  },
  {
    path: "aboutus",
    component: AboutUsComponent
  },
  {
    path: "media",
    component: MediaComponent
  },
  {
    path: "carreers",
    component: CarreersComponent
  },
  {
    path: "activation",
    component: ConfirmAccountComponent
  },
  {
    path: "change-password-phone",
    component: ChangePasswordPhoneComponent
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
