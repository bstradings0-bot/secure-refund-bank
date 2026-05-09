export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
}

export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  PREMIUM = 'PREMIUM',
}

export enum CardStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  INTERNAL = 'INTERNAL',
  BANK = 'BANK',
  SWIFT = 'SWIFT',
  CRYPTO = 'CRYPTO',
  MOBILE = 'MOBILE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum OtpType {
  EMAIL = 'EMAIL',
  TWO_FA = 'TWO_FA',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESUBMISSION_REQUIRED = 'RESUBMISSION_REQUIRED',
}

export enum KycDocumentType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  SELFIE = 'SELFIE',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_USER = 'RESOLVED_USER',
  RESOLVED_PLATFORM = 'RESOLVED_PLATFORM',
  CLOSED = 'CLOSED',
  EVIDENCE_REQUESTED = 'EVIDENCE_REQUESTED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum PaymentMethod {
  CARD = 'CARD',
  ACH = 'ACH',
  SEPA = 'SEPA',
  WIRE = 'WIRE',
  STRIPE = 'STRIPE',
  WISE = 'WISE',
}

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  CARD = 'CARD',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  otpCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  address?: string;
}

export interface TransferRequest {
  receiverEmail: string;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
}

export interface CardCreateRequest {
  cardType: CardType;
  colorTheme?: string;
  spendingLimit?: number;
  initialBalance?: number;
}

export interface CardUpdateRequest {
  label?: string;
  colorTheme?: string;
  spendingLimit?: number;
}

export interface CardAnalytics {
  card: VirtualCardData;
  totalSpent: number;
  spendingLimit: number;
  remainingLimit: number;
  usagePercent: number;
}

export interface VirtualCardData {
  id: string;
  accountId: string;
  userId: string;
  cardType: CardType;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardholderName: string;
  cardLabel?: string;
  balance: number;
  status: CardStatus;
  spendingLimit: number;
  colorTheme: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  account: {
    id: string;
    balance: number;
    savingsBalance: number;
    currency: string;
    status: AccountStatus;
  };
  recentTransactions: unknown[];
  cards: unknown[];
  notifications: unknown[];
  totalSent: number;
  totalReceived: number;
}

// ---- Production Fintech Interfaces ----

export interface KycDocumentData {
  id: string;
  userId: string;
  documentType: KycDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: KycStatus;
  reviewerId?: string;
  reviewerNotes?: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface KycSubmitRequest {
  documentType: KycDocumentType;
}

export interface KycReviewRequest {
  approved: boolean;
  notes?: string;
  rejectionReason?: string;
}

export interface BankAccountData {
  id: string;
  userId: string;
  institutionName: string;
  institutionId?: string;
  maskedAccountNumber: string;
  accountType: string;
  isVerified: boolean;
  isPrimary: boolean;
  status: string;
  linkedAt: string;
}

export interface BankAccountLinkRequest {
  publicToken: string;
  institutionId: string;
  institutionName: string;
  accountId: string;
}

export interface PlaidLinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface DepositRequest {
  amount: number;
  currency?: string;
  method: PaymentMethod;
  bankAccountId?: string;
}

export interface WithdrawalRequest {
  amount: number;
  currency?: string;
  bankAccountId: string;
}

export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface WiseTransferRequest {
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  recipientEmail: string;
  recipientName: string;
  reference?: string;
}

export interface WiseQuoteResponse {
  quoteId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  fee: number;
  expirationTime: string;
}

export interface DisputeData {
  id: string;
  transactionId: string;
  userId: string;
  reason: string;
  description?: string;
  evidenceUrl?: string;
  status: DisputeStatus;
  adminNotes?: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeCreateRequest {
  transactionId: string;
  reason: string;
  description?: string;
}

export interface ComplianceLogData {
  id: string;
  userId?: string;
  transactionId?: string;
  action: string;
  riskLevel: RiskLevel;
  riskScore: number;
  details?: string;
  triggeredBy?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface RiskAssessment {
  userId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: string[];
  assessedAt: string;
}

export interface FeeRecordData {
  id: string;
  transactionId?: string;
  userId: string;
  feeType: string;
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
}
