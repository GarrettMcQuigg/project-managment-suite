export const ROOT_ROUTE = '/';
export const ROUTE_SEPARATOR = '/';

// Auth pages
export const AUTH_ROUTE = '/auth';
export const AUTH_CHECKPOINT_ROUTE = '/auth/checkpoint';
export const AUTH_SIGNUP_ROUTE = `${AUTH_ROUTE}/signup`;
export const AUTH_SIGNIN_ROUTE = `${AUTH_ROUTE}/signin`;
export const AUTH_RESET_PASSWORD_ROUTE = `${AUTH_ROUTE}/reset-password`;

// Landing pages
export const ABOUT_US_ROUTE = '/about-us';
export const PRICING_ROUTE = '/pricing';
export const TERMS_OF_SERVICE_ROUTE = '/terms-of-service';
export const PRIVACY_POLICY_ROUTE = '/privacy-policy';
export const PRODUCTS_ROUTE = '/products';
export const PRODUCTS_BMS_ROUTE = `${PRODUCTS_ROUTE}/bms`;
export const PRODUCTS_FINANCIAL_SERVICES_ROUTE = `${PRODUCTS_ROUTE}/financial-services`;
export const PRODUCTS_PRODUCTIVITY_ROUTE = `${PRODUCTS_ROUTE}/productivity`;
export const PRODUCTS_SUPPORT_AI_ROUTE = `${PRODUCTS_ROUTE}/support-ai`;

// Main pages
export const DASHBOARD_ROUTE = '/dashboard';
export const EMAIL_ROUTE = '/email';
export const TASKS_ROUTE = '/tasks';
export const SECURITY_ROUTE = '/security';
export const CALENDAR_ROUTE = '/calendar';
export const MEETINGS_ROUTE = '/meetings';
export const BILLING_ROUTE = '/billing';
export const SHOP_ROUTE = '/shop';

// API routes...
export const API_ROUTE = '/api';
export const API_NEWSLETTER_ROUTE = `${API_ROUTE}/newsletter`;
export const API_NEWSLETTER_SUBSCRIBE_ROUTE = `${API_NEWSLETTER_ROUTE}/subscribe`;
export const API_NEWSLETTER_UNSUBSCRIBE_ROUTE = `${API_NEWSLETTER_ROUTE}/unsubscribe`;

export const API_AUTH_ROUTE = `${API_ROUTE}/auth`;
export const API_AUTH_CHECKPOINT_ROUTE = `${API_ROUTE}/auth/checkpoint`;
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

export const API_USER_ROUTE = `${API_ROUTE}/user`;

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
