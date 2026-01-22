import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CanActivateGuard } from './can-activate.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.loginModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./mandate/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [CanActivateGuard],
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./search/search.module').then((m) => m.SearchModule),
  },

  {
    path: 'leadassign',
    loadChildren: () =>
      import('./mandate/leadassign/leadassign.module').then(
        (m) => m.LeadassignModule
      ),
  },
  {
    path: 'reminders',
    loadChildren: () =>
      import('./reminders/reminders.module').then((m) => m.RemindersModule),
  },
  {
    path: 'visit-updates',
    loadChildren: () =>
      import('./visit-updates/visit-updates.module').then(
        (m) => m.VisitUpdatesModule
      ),
  },

  {
    path: 'Enquiry',
    loadChildren: () =>
      import('./enquiry/enquiry.module').then((m) => m.EnquiryModule),
  },
  {
    path: 'mandate-myoverdues',
    loadChildren: () =>
      import('./mandate/mandate-overdues/mandate-overdues.module').then(
        (m) => m.MandateOverduesModule
      ),
  },

  {
    path: 'mymandatereports',
    loadChildren: () =>
      import(
        './mandate/mandate-exec-activities/mandate-exec-activities.module'
      ).then((m) => m.MandateExecActivitiesModule),
  },

  {
    path: 'leads',
    loadChildren: () =>
      import('./leads/leads.module').then((m) => m.LeadsModule),
  },

  {
    path: 'mandate-plans',
    loadChildren: () =>
      import('./mandate/mandate-plans/mandate-plans.module').then(
        (m) => m.MandatePlanModule
      ),
  },

  {
    path: 'mandate-visit-stages',
    loadChildren: () =>
      import('./mandate/mandate-visit-stages/mandate-visit-sages.module').then(
        (m) => m.MaMandateVisitStagesModule
      ),
  },
  {
    path: 'mandate-lead-stages',
    loadChildren: () =>
      import('./mandate/mandate-lead-stages/mandate-lead-stages.module').then(
        (m) => m.MandateLeadStagesModule
      ),
  },
  {
    path: 'mandate-inactive-junk',
    loadChildren: () =>
      import(
        './mandate/mandate-inactive-junk/mandate-inactive-junk.module'
      ).then((m) => m.MandateInactiveJunkModule),
  },
  {
    path: 'mandate-feedback',
    loadChildren: () =>
      import('./mandate/mandate-feedback/mandate-feedback.module').then(
        (m) => m.MandateFeedbackModule
      ),
  },
  {
    path: 'mandate-pricing-list',
    loadChildren: () =>
      import('./mandate/mandate-pricing-list/mandate-pricing-list.module').then(
        (m) => m.MandatePricingListModule
      ),
  },
  {
    path: 'addproperty',
    loadChildren: () =>
      import('./addproperty/addproperty.component.module').then(
        (m) => m.AddpropertyModule
      ),
  },
  {
    path: 'hourly-report',
    loadChildren: () =>
      import('./hourly-report/hourly-report.module').then(
        (m) => m.HourlyReportModule
      ),
  },
  {
    path: 'hourly-report-listing',
    loadChildren: () =>
      import('./hourly-report-listing/hourly-report-listing.module').then(
        (m) => m.HourlyReportListingModule
      ),
  },
  {
    path: 'chats',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
  },
  {
    path: 'whatsapp-visits',
    loadChildren: () =>
      import('./whatsapp-visits/whatsapp-visits.module').then(
        (m) => m.WhatsappVisitsModule
      ),
  },
  {
    path: 'attendance',
    loadChildren: () =>
      import('./attendance/attendance.module').then((m) => m.AttendanceModule),
  },
  // { path: 'mandate-lead-details',
  //   loadChildren: () => import('./mandate-lead-details/mandtae-lead-details.module').then(m => m.MandateLeadDetailsModule),
  // },
  {
    path: 'mandate-customers',
    loadChildren: () =>
      import(
        './mandate/mandate-customer-details/mandate-customer-details.module'
      ).then((m) => m.MandateCustomerdetailsModule),
  },
  {
    path: 'clients-chats',
    loadChildren: () =>
      import('./clients-chats/clients-chats.module').then(
        (m) => m.ClientsChatsModule
      ),
  },
  {
    path: 'all-and-live-call-details',
    loadChildren: () =>
      import(
        './all-and-live-call-details/all-and-live-call-details.module'
      ).then((m) => m.AllAndLiveCallDetailsModule),
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'inventory-dashboard',
    loadChildren: () =>
      import('./inventory-dashboard/inventory-dashboard.module').then(
        (m) => m.InventoryDashboardModule
      ),
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'all-call-listing',
    loadChildren: () =>
      import('./all-calls-listing/all-calls-listing.module').then(
        (m) => m.AllCallsListingModule
      ),
  },
  {
    path: 'source-dashboard',
    loadChildren: () =>
      import('./source-dashboard/source-dashboard.module').then(
        (m) => m.SourceDashboardModule
      ),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./notification/notification.module').then(
        (m) => m.NotificationModule
      ),
  },
  {
    path: 'employeeAttendance',
    loadChildren: () =>
      import('./employee-attendance/employee-attendance.module').then(
        (m) => m.EmployeeAttendanceModule
      ),
  },
  {
    path: 'overdues-dashboard',
    loadChildren: () =>
      import('./overdues-dashboard/overdues-dashboard.module').then(
        (m) => m.OverduesDashboardModule
      ),
  },
  {
    path: 'junk-dashboard',
    loadChildren: () =>
      import('./junk-dashboard/junk-dashboard.module').then(
        (m) => m.JunkDashboardModule
      ),
  },
  {
    path: 'today-dashboard',
    loadChildren: () =>
      import('./today-dashboard/today-dashboard.module').then(
        (m) => m.TodayDashboardModule
      ),
  },
  {
    path: 'switch-account',
    loadChildren: () =>
      import('./switch-account/switch-account.module').then(
        (m) => m.SwitchAccountdModule
      ),
  },
  {
    path: 'stage-dashboard',
    loadChildren: () =>
      import('./stage-dashboard/stage-dashboard.module').then(
        (m) => m.StageDashboardModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
