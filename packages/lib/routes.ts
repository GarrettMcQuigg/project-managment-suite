export const ROOT_ROUTE = '/';
export const ROUTE_SEPARATOR = '/';

// Auth pages
export const AUTH_ROUTE = '/auth';
export const AUTH_SIGNUP_ROUTE = `${AUTH_ROUTE}/signup`;
export const AUTH_SIGNUP_FROM_PRICING_ROUTE = `${AUTH_ROUTE}/signup?from=pricing`;
export const AUTH_SIGNIN_ROUTE = `${AUTH_ROUTE}/signin`;
export const AUTH_RESET_PASSWORD_ROUTE = `${AUTH_ROUTE}/reset-password`;

// Landing pages
export const ABOUT_US_ROUTE = '/about-us';
export const PRICING_ROUTE = '/pricing';
export const TERMS_OF_SERVICE_ROUTE = '/terms-of-service';
export const PRIVACY_POLICY_ROUTE = '/privacy-policy';
export const FEATURES_ROUTE = '/features';

// Main pages
export const DASHBOARD_ROUTE = '/dashboard';
export const PROJECTS_ROUTE = '/projects';
export const CLIENTS_ROUTE = '/clients';
export const INVOICES_ROUTE = '/invoices';
export const CALENDAR_ROUTE = '/calendar';
export const PROJECT_BOARD_ROUTE = '/project-board';
export const SUPPORT_ROUTE = '/support';
export const SETTINGS_ROUTE = '/settings';

// Project pages
export const PROJECT_DETAILS_ROUTE = `${PROJECTS_ROUTE}/:id`;
export const PROJECT_PORTAL_ROUTE = `${PROJECTS_ROUTE}/:id/portal/:portalSlug`;

// Client pages
export const CLIENT_DETAILS_ROUTE = `${CLIENTS_ROUTE}/:id`;

// Invoice pages
export const INVOICE_DETAILS_ROUTE = `${INVOICES_ROUTE}/:id`;

// API routes...
export const API_ROUTE = '/api';
export const API_NEWSLETTER_ROUTE = `${API_ROUTE}/newsletter`;
export const API_NEWSLETTER_SUBSCRIBE_ROUTE = `${API_NEWSLETTER_ROUTE}/subscribe`;
export const API_NEWSLETTER_UNSUBSCRIBE_ROUTE = `${API_NEWSLETTER_ROUTE}/unsubscribe`;

export const API_AUTH_ROUTE = `${API_ROUTE}/auth`;
export const API_AUTH_SIGNUP_ROUTE = `${API_AUTH_ROUTE}/signup`;
export const API_AUTH_SIGNUP_AVAILABILITY_ROUTE = `${API_AUTH_SIGNUP_ROUTE}/availability`;
export const API_AUTH_SIGNUP_AVAILABILITY_EMAIL_ROUTE = `${API_AUTH_SIGNUP_AVAILABILITY_ROUTE}/email`;
export const API_AUTH_SIGNUP_AVAILABILITY_PHONE_ROUTE = `${API_AUTH_SIGNUP_AVAILABILITY_ROUTE}/phone`;
export const API_AUTH_SIGNIN_ROUTE = `${API_AUTH_ROUTE}/signin`;
export const API_AUTH_SIGNIN_PART_ONE_ROUTE = `${API_AUTH_SIGNIN_ROUTE}/part-one`;
export const API_AUTH_SIGNIN_PART_TWO_ROUTE = `${API_AUTH_SIGNIN_ROUTE}/part-two`;
export const API_AUTH_RESET_PASSWORD_ROUTE = `${API_AUTH_ROUTE}/reset-password`;
export const API_AUTH_SIGNOUT_ROUTE = `${API_AUTH_ROUTE}/signout`;
export const API_AUTH_MFA_ROUTE = `${API_AUTH_ROUTE}/mfa`;
export const API_AUTH_MFA_SEND_EMAIL_ROUTE = `${API_AUTH_MFA_ROUTE}/send-email`;
export const API_AUTH_MFA_SEND_SMS_ROUTE = `${API_AUTH_MFA_ROUTE}/send-sms`;
export const API_AUTH_SUBSCRIPTION_ROUTE = `${API_AUTH_ROUTE}/subscription`;

export const API_USER_ROUTE = `${API_ROUTE}/user`;

export const API_PROJECT_ROUTE = `${API_ROUTE}/project`;
export const API_PROJECT_ADD_ROUTE = `${API_PROJECT_ROUTE}/add`;
export const API_PROJECT_UPDATE_ROUTE = `${API_PROJECT_ROUTE}/update`;
export const API_PROJECT_DELETE_ROUTE = `${API_PROJECT_ROUTE}/delete`;
export const API_PROJECT_LIST_ROUTE = `${API_PROJECT_ROUTE}/list`;
export const API_PROJECT_GET_BY_ID_ROUTE = `${API_PROJECT_ROUTE}/get-by-id?id=`;
export const API_PROJECT_UPDATE_CHECKPOINT_STATUS_ROUTE = `${API_PROJECT_ROUTE}/checkpoints/status`;
export const API_PROJECT_MESSAGES_SEND_ROUTE = `${API_PROJECT_ROUTE}/messages/send`;
export const API_PROJECT_MESSAGES_LIST_ROUTE = `${API_PROJECT_ROUTE}/messages/list?id=`;
export const API_PROJECT_CHECKPOINT_MESSAGES_SEND_ROUTE = `${API_PROJECT_ROUTE}/checkpoint/messages/send`;

export const API_CLIENT_ROUTE = `${API_ROUTE}/client`;
export const API_CLIENT_ADD_ROUTE = `${API_CLIENT_ROUTE}/add`;
export const API_CLIENT_UPDATE_ROUTE = `${API_CLIENT_ROUTE}/update`;
export const API_CLIENT_DELETE_ROUTE = `${API_CLIENT_ROUTE}/delete`;
export const API_CLIENT_LIST_ROUTE = `${API_CLIENT_ROUTE}/list`;
export const API_CLIENT_GET_BY_ID_ROUTE = `${API_CLIENT_ROUTE}/get-by-id?id=`;

export const API_INVOICE_ROUTE = `${API_ROUTE}/invoice`;
export const API_INVOICE_ADD_ROUTE = `${API_INVOICE_ROUTE}/add`;
export const API_INVOICE_UPDATE_ROUTE = `${API_INVOICE_ROUTE}/update`;
export const API_INVOICE_DELETE_ROUTE = `${API_INVOICE_ROUTE}/delete`;
export const API_INVOICE_LIST_ROUTE = `${API_INVOICE_ROUTE}/list`;
export const API_INVOICE_GET_BY_ID_ROUTE = `${API_INVOICE_ROUTE}/get-by-id?id=`;
export const API_INVOICE_GET_BY_PROJECT_ROUTE = `${API_INVOICE_ROUTE}/get-by-project?projectId=`;
export const API_INVOICE_GENERATE_NUMBER_ROUTE = `${API_INVOICE_ROUTE}/generate-invoice-number`;

export const API_CALENDAR_ROUTE = `${API_ROUTE}/calendar`;
export const API_CALENDAR_EVENT_ADD_ROUTE = `${API_CALENDAR_ROUTE}/event/add`;
export const API_CALENDAR_EVENT_UPDATE_ROUTE = `${API_CALENDAR_ROUTE}/event/update`;
export const API_CALENDAR_EVENT_DELETE_ROUTE = `${API_CALENDAR_ROUTE}/event/delete`;
export const API_CALENDAR_EVENT_LIST_ROUTE = `${API_CALENDAR_ROUTE}/event/list`;

export const API_USER_PROFILE_UPDATE_ROUTE = `${API_USER_ROUTE}/profile/update`;

export const API_AUTH_PORTAL_ROUTE = `${API_AUTH_ROUTE}/portal`;
export const API_AUTH_PORTAL_GET_BY_ID_ROUTE = `${API_AUTH_PORTAL_ROUTE}/get-by-id?id=`;

// Analytics
export const API_ANALYTICS_COMMUNICATION_ROUTE = `${API_ROUTE}/analytics/communication`;

// Stripe API routes
export const API_STRIPE_ROUTE = `${API_ROUTE}/stripe`;
export const API_STRIPE_CONNECT_ROUTE = `${API_STRIPE_ROUTE}/connect`;
export const API_STRIPE_CHECKOUT_ROUTE = `${API_STRIPE_ROUTE}/checkout`;
export const API_STRIPE_WEBHOOK_ROUTE = `${API_STRIPE_ROUTE}/webhook`;
export const API_STRIPE_STATUS_ROUTE = `${API_STRIPE_ROUTE}/status`;

// Helpers
export function routeWithPath(route: string, path: string) {
  return `${route}/${path}`;
}

export function routeWithParam(route: string, params: { [key: string]: string }) {
  let resultRoute = route;

  for (const [key, value] of Object.entries(params)) {
    resultRoute = resultRoute.replace(`:${key}`, value);
  }
  return resultRoute;
}
