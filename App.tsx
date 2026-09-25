import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import BalanceCard from "./components/BalanceCard";
import ActionGrid from "./components/ActionGrid";
import Banner from "./components/Banner";
import BottomNav from "./components/BottomNav";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Rewards from "./components/Rewards";
import Subscribe from "./components/Subscribe";
import SubscribePayment from "./components/SubscribePayment";
import PaymentCallback from "./components/PaymentCallback";
import SendMoney from "./components/SendMoney";
import AdminDashboard from "./components/AdminDashboard";
import TransactionHistory from "./components/TransactionHistory";
import TransactionReceipt from "./components/TransactionReceipt";
import BuyAirtimeData from "./components/BuyAirtimeData";
import TelegramAd from "./components/TelegramAd";
import LiveNotifications from "./components/LiveNotifications";
import Restricted from "./components/Restricted";
import SubscriptionNotification from "./components/SubscriptionNotification";
import ActiveSubscriptionNotification from "./components/ActiveSubscriptionNotification";
import ImminentDeactivationNotification from "./components/ImminentDeactivationNotification";
import ImminentPayment from "./components/ImminentPayment";
import TaskPage from "./components/TaskPage";
import UpgradeProposal from "./components/UpgradeProposal";
import UpgradePayment from "./components/UpgradePayment";
import LinkWithdrawAccount from "./components/LinkWithdrawAccount";
import HowItWorks from "./components/HowItWorks";
import NotificationFeed from "./components/NotificationFeed";
import Referrals from "./components/Referrals";
import FloatingMoneyBackground from "./components/FloatingMoneyBackground";
import Partnership from "./components/Partnership";
import Investment from "./components/Investment";
import PromoPage from "./components/PromoPage";
import DepositPage from "./components/DepositPage";
import { CommunityPage } from "./components/CommunityPage";
import { AdvertisePage } from "./components/AdvertisePage";
import { Icons } from "./components/Icons";
import { InstalledAppIcon } from "./components/InstalledAppIcon";
import { User, Plan, Transaction, RewardStatus, WithdrawalRequest } from "./types";
import { GoogleGenAI, Modality } from "@google/genai";
import { doc, onSnapshot, setDoc, getDoc, db, auth, useAppChannels } from "./firebase";
import RecentTransactionsList from "./components/RecentTransactionsList";
import ServicesPage from "./components/ServicesPage";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const DEFAULT_NOTIFICATION_PREFERENCES = {
  withdrawals: true,
  transfers: true,
  airtime: true,
  rewards: true,
};

const App: React.FC = () => {
  const { channels } = useAppChannels();
  const [initialRefCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("ref") || "";
    } catch (e) {
      return "";
    }
  });

  // PWA & Android Installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isNewRegistration, setIsNewRegistration] = useState(() => {
    try {
      return sessionStorage.getItem("chix9ja_just_registered") === "true";
    } catch {
      return false;
    }
  });
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStepLog, setInstallStepLog] = useState("");
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
        const stored = localStorage.getItem("chix9ja_app_installed") === "true";
        return isStandalone || stored;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Splash Screen States
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  useEffect(() => {
    const onInstalled = () => {
      setIsAppInstalled(true);
      try {
        localStorage.setItem("chix9ja_app_installed", "true");
      } catch {}
    };
    window.addEventListener("appinstalled", onInstalled);

    try {
      const matcher = window.matchMedia("(display-mode: standalone)");
      const onChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setIsAppInstalled(true);
          try {
            localStorage.setItem("chix9ja_app_installed", "true");
          } catch {}
        }
      };
      matcher.addEventListener("change", onChange);
      return () => {
        window.removeEventListener("appinstalled", onInstalled);
        matcher.removeEventListener("change", onChange);
      };
    } catch {
      return () => window.removeEventListener("appinstalled", onInstalled);
    }
  }, []);

  useEffect(() => {
    const duration = 4000;
    const intervalTime = 40; // 40ms intervals
    const totalSteps = duration / intervalTime; // 100 steps
    let currentStep = 0;

    const splashProgressInterval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      setSplashProgress(nextProgress);
      
      if (currentStep >= totalSteps) {
        clearInterval(splashProgressInterval);
        setTimeout(() => {
          setShowSplashScreen(false);
        }, 150);
      }
    }, intervalTime);

    return () => {
      clearInterval(splashProgressInterval);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA beforeinstallprompt captured!");
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallAppOnDevice = () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted native installation");
            setIsAppInstalled(true);
            try {
              localStorage.setItem("chix9ja_app_installed", "true");
            } catch {}
            setShowInstallPopup(false);
          } else {
            console.log("User declined native installation");
          }
          setDeferredPrompt(null);
        });
        return;
      } catch (err) {
        console.error("Native installation prompt rejected, reverting to simulated package compiler:", err);
      }
    }

    // High fidelity simulated installation for iFrame and direct non-PWA Chromium fallbacks
    setIsInstalling(true);
    setInstallProgress(0);
    setInstallStepLog("🔍 Initializing security handshake...");

    const steps = [
      { progress: 15, log: "🔍 Initializing secure sandbox environment..." },
      { progress: 32, log: "📦 Allocating 9jacash client space (4.8 MB)..." },
      { progress: 48, log: "✈️ Loading remote server API endpoints..." },
      { progress: 65, log: "🛡️ Compiling 9jacash Secure Android APK wrapper..." },
      { progress: 79, log: "⚡ Linking database synchronization channels..." },
      { progress: 92, log: "📲 Registering local device push alert notifications..." },
      { progress: 100, log: "✓ 9jacash successfully added to device launcher!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setInstallProgress(step.progress);
        setInstallStepLog(step.log);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsInstalling(false);
          setIsAppInstalled(true);
          try {
            localStorage.setItem("chix9ja_app_installed", "true");
          } catch {}
          setShowInstallPopup(false);
          alert("9jacash has been successfully added to your device Home Launcher with the new 3D Gold & Emerald official app icon! Access us directly from your drawer anytime.");
        }, 1200);
      }
    }, 600);
  };

  // Global Time State for Deactivation & Subscription Logic
  const [now, setNow] = useState(Date.now());
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Standalone Admin Path States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("chix9ja_admin_logged_in") === "true";
    } catch {
      return false;
    }
  });
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  useEffect(() => {
    if (initialRefCode) {
      setCurrentView("register");
    }
  }, [initialRefCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Helper to get stored users safely
  const getStoredUsers = () => {
    try {
      const stored = localStorage.getItem("chix9ja_users");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  };

  // Initialize User State from LocalStorage (Persistence)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const activeEmail = localStorage.getItem("chix9ja_active_session");
      if (activeEmail) {
        const users = getStoredUsers();
        const storedUser = users[activeEmail.toLowerCase()];
        if (storedUser) {
          // Migration: Ensure transactions array exists
          if (!storedUser.transactions) {
            storedUser.transactions = [
              {
                id: "trx-init",
                type: "credit",
                amount: 10000,
                description: "Welcome Bonus",
                date: new Date().toISOString(),
                status: "success",
              },
            ];
          }
          // Migration: Ensure rewardStatus exists
          if (!storedUser.rewardStatus) {
            storedUser.rewardStatus = {
              currentDay: 1,
              lastClaimedTimestamp: 0,
            };
          }
          // Migration: Ensure notificationPreferences exists
          if (!storedUser.notificationPreferences) {
            storedUser.notificationPreferences = {
              ...DEFAULT_NOTIFICATION_PREFERENCES,
            };
          }
          // Migration: Ensure lastWhatsAppClaimTimestamp exists
          if (storedUser.lastWhatsAppClaimTimestamp === undefined) {
            storedUser.lastWhatsAppClaimTimestamp = 0;
          }
          // Migration: Ensure lastTelegramClaim2Timestamp exists
          if (storedUser.lastTelegramClaim2Timestamp === undefined) {
            storedUser.lastTelegramClaim2Timestamp = 0;
          }
          // Migration: Ensure balance is a valid number (never NaN)
          if (typeof storedUser.balance !== "number" || isNaN(storedUser.balance)) {
            storedUser.balance = Number(storedUser.balance) || 0;
          }
          // Migration: Ensure referral code & details exist
          if (!storedUser.referralCode) {
            storedUser.referralCode = activeEmail.split("@")[0].toUpperCase();
          }
          if (storedUser.referralCount === undefined) {
            storedUser.referralCount = 0;
          }
          if (storedUser.referralEarnings === undefined) {
            storedUser.referralEarnings = 0;
          }
          if (!storedUser.referredUsers) {
            storedUser.referredUsers = [];
          }
          // Save migrations immediately
          users[activeEmail.toLowerCase()] = storedUser;
          localStorage.setItem("chix9ja_users", JSON.stringify(users));

          return storedUser;
        }
      }
    } catch (e) {
      console.error("Error restoring session", e);
    }
    const defaultUser: User = {
      name: "Pellino",
      email: "pellino@chix9ja.com",
      balance: 0,
      transactions: [
        {
          id: "trx-bonus-init",
          type: "credit",
          amount: 10000,
          description: "Welcome Bonus",
          date: new Date().toISOString(),
          status: "success",
        },
      ],
      rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      referralCode: "PELLINO99",
      referralCount: 0,
      referralEarnings: 0,
    };
    try {
      const users = getStoredUsers();
      users["pellino@chix9ja.com"] = defaultUser;
      localStorage.setItem("chix9ja_users", JSON.stringify(users));
      localStorage.setItem("chix9ja_active_session", "pellino@chix9ja.com");
    } catch {}
    return defaultUser;
  });

  // Helper to sanitize undefined values recursively for Firestore compatibility
  const sanitizeForFirestore = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(sanitizeForFirestore);
    }
    if (typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          newObj[key] = sanitizeForFirestore(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  };

  // Helper to save user to local storage and sync with Firestore database
  const saveUserToStorage = (u: User) => {
    const emailKey = u.email.toLowerCase().trim();
    const cleanUser = {
      ...u,
      balance: typeof u.balance === "number" && !isNaN(u.balance) ? u.balance : (Number(u.balance) || 0),
    };
    const existingUsers = getStoredUsers();
    existingUsers[emailKey] = cleanUser;
    localStorage.setItem("chix9ja_users", JSON.stringify(existingUsers));

    // Async write to Firestore so database is always fully synced across devices
    const sanitizedUser = sanitizeForFirestore(cleanUser);
    setDoc(doc(db, "users", emailKey), sanitizedUser, { merge: true }).catch((error) => {
      console.error("Error syncing to Firestore:", error);
    });
  };

  // Real-time synchronization effect using Firebase Auth state & Firestore subscription
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser?.email) {
        const emailKey = authUser.email.toLowerCase().trim();
        const userDocRef = doc(db, "users", emailKey);

        // Listen in real-time to user's central account document
        const unsubDoc = onSnapshot(
          userDocRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.data() as User;
              if (typeof userData.balance !== "number" || isNaN(userData.balance)) {
                userData.balance = Number(userData.balance) || 0;
              }
              setUser(userData);

              // Sync to local storage
              const existingUsers = getStoredUsers();
              existingUsers[emailKey] = userData;
              localStorage.setItem(
                "chix9ja_users",
                JSON.stringify(existingUsers),
              );
              localStorage.setItem("chix9ja_active_session", emailKey);
            }
          },
          (err) => {
            console.error("Firestore real-time snapshot error:", err);
          },
        );

        return () => unsubDoc();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.adminNotifications) {
      const hasUnread = user.adminNotifications
        .filter((n) => !n.isEmail)
        .some((n) => !n.read);
      setHasUnreadNotifications(hasUnread);
    }
  }, [user?.adminNotifications]);

  // Periodic deletion of admin notifications older than 1 hour after being seen
  useEffect(() => {
    if (
      !user ||
      !user.email ||
      !user.adminNotifications ||
      user.adminNotifications.length === 0
    )
      return;

    const nowMs = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Check if there are any that have expired (expiry counted from when seen/read)
    const expiredCount = user.adminNotifications.filter((n) => {
      if (n.isEmail) return false;
      if (!n.seenAt) return false; // If unseen, the countdown hasn't started yet!
      return nowMs - n.seenAt >= oneHour;
    }).length;

    if (expiredCount > 0) {
      // Filter out all expired ones
      const validNotifications = user.adminNotifications.filter((n) => {
        if (n.isEmail) return true;
        if (!n.seenAt) return true;
        return nowMs - n.seenAt < oneHour;
      });

      const updatedUser = {
        ...user,
        adminNotifications: validNotifications,
      };

      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  }, [user, now]);

  // Automatically mark unseen admin notifications as seen when user renders them
  useEffect(() => {
    if (user && user.adminNotifications && user.adminNotifications.length > 0) {
      const hasUnseen = user.adminNotifications.some((n) => !n.isEmail && !n.seenAt);
      if (hasUnseen) {
        const updatedNotifications = user.adminNotifications.map((n) => {
          if (!n.isEmail && !n.seenAt) {
            return { ...n, seenAt: Date.now(), read: true };
          }
          return n;
        });
        const updatedUser = {
          ...user,
          adminNotifications: updatedNotifications,
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
      }
    }
  }, [user]);

  // Check Subscription Expiry
  useEffect(() => {
    if (user?.isSubscribed && user.subscriptionExpiryDate) {
      if (now > user.subscriptionExpiryDate) {
        const updatedUser = {
          ...user,
          isSubscribed: false,
          subscriptionPlan: undefined,
          subscriptionExpiryDate: undefined,
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
      }
    }
  }, [now, user]);

  // Check Referral-Based Auto-Subscription and pMode activation (30+ referrals)
  useEffect(() => {
    if (user && (user.referralCount || 0) >= 30) {
      const isSubscribedToWeekly = user.isSubscribed && user.subscriptionPlan === "Weekly Saver";
      const isPModeOn = !!user.isPMode;

      if (!isSubscribedToWeekly || !isPModeOn) {
        const expiryTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const updatedUser = {
          ...user,
          isSubscribed: true,
          subscriptionPlan: "Weekly Saver",
          subscriptionExpiryDate: expiryTimestamp,
          isPMode: true,
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        console.log(`Auto-subscribed ${user.email} to Weekly Saver and activated pMode due to reaching 30 referrals.`);
      }
    }
  }, [user]);

  // Check Loan Expiry and Auto-Debit
  useEffect(() => {
    if (user?.loanBalance && user.loanExpiry) {
      if (now > user.loanExpiry) {
        const amountToRepay = user.loanBalance;
        const newTransaction: Transaction = {
          id: `trx-loan-repay-${Date.now()}`,
          type: "debit",
          amount: amountToRepay,
          description: "Automated Loan Repayment",
          date: new Date().toISOString(),
          status: "success",
        };
        const updatedUser = {
          ...user,
          balance: user.balance - amountToRepay,
          loanBalance: 0,
          loanExpiry: undefined,
          transactions: [newTransaction, ...(user.transactions || [])],
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        alert(
          `Loan Repayment Successful: ₦${amountToRepay.toLocaleString()} has been debited from your balance.`,
        );
      }
    }
  }, [now, user]);

  // Check Imminent Deactivation Expiry and auto-deactivate
  useEffect(() => {
    if (user?.imminentDeactivationExpiry) {
      if (now > user.imminentDeactivationExpiry && !user.deactivationDate) {
        const updatedUser = {
          ...user,
          imminentDeactivationExpiry: undefined,
          deactivationDate: now - 1000,
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
      }
    }
  }, [now, user]);

  const isDeactivated = user?.deactivationDate
    ? now > user.deactivationDate
    : false;
  const showImminentWarning =
    user?.imminentDeactivationExpiry &&
    now < user.imminentDeactivationExpiry &&
    !isDeactivated;
  const isVipUser = Boolean(user?.isVIP);
  const isAccountLinked = Boolean(user?.isAccountLinkedVerified);
  const hasAwaitingCbnTax =
    isVipUser &&
    !isAccountLinked &&
    user?.transactions?.some(
      (t) =>
        t.type === "debit" &&
        (t.status === "awaiting_cbn_tax" ||
          t.status === "awaiting_cbn_tax_clearance"),
    );

  const hasPendingWithdrawal =
    !user?.isStarMember &&
    user?.transactions?.some(
      (t) =>
        t.type === "debit" &&
        !isAccountLinked &&
        (t.status === "pending" ||
          t.status === "awaiting_cbn_tax" ||
          t.status === "awaiting_cbn_tax_clearance"),
    );

  const [currentView, setCurrentView] = useState<
    "login" | "register" | "dashboard" | "payment-callback"
  >(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if ((params.get("transaction_id") || params.get("id")) && params.get("status")) {
        return "payment-callback";
      }
    } catch {}
    return "dashboard";
  });

  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedVipTier, setSelectedVipTier] = useState<'vip1' | 'vip2' | 'vip3'>('vip1');
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [serviceType, setServiceType] = useState<"airtime" | "data">("airtime");
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);
  const [taskMode, setTaskMode] = useState<"quiz" | "telegram" | "all">("all");
  const [showVipNotice, setShowVipNotice] = useState(false);
  const [showWithdrawReferralAdvert, setShowWithdrawReferralAdvert] =
    useState(false);
  const [showWithdrawFailedPopup, setShowWithdrawFailedPopup] =
    useState(false);
  const [showActiveSubscriptionNotice, setShowActiveSubscriptionNotice] =
    useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [supportSubject, setSupportSubject] = useState("General Support");
  const [supportMsg, setSupportMsg] = useState("");
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  // Guard against navigating to subscribe while already subscribed
  useEffect(() => {
    if (user?.isSubscribed && (activeTab === "subscribe" || activeTab === "subscribe_payment")) {
      setActiveTab("home");
      setShowActiveSubscriptionNotice(true);
    }
  }, [activeTab, user?.isSubscribed]);

  // Guard: unsubscribed member cannot open or remain on send_money or link_withdraw_account
  useEffect(() => {
    if ((!user || !user.isSubscribed) && (activeTab === "send_money" || activeTab === "link_withdraw_account")) {
      setActiveTab("home");
      setShowWithdrawFailedPopup(true);
    }
  }, [activeTab, user?.isSubscribed]);

  useEffect(() => {
    if (isNewRegistration && currentView === "dashboard" && activeTab === "home") {
      console.log("New user detected. Loading 7 seconds installation timeout...");
      const timer = setTimeout(() => {
        setShowInstallPopup(true);
        setIsNewRegistration(false);
        try {
          sessionStorage.removeItem("chix9ja_just_registered");
        } catch {}
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isNewRegistration, currentView, activeTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "admin" || params.get("admin") === "true") {
      setCurrentView("dashboard");
      setActiveTab("admin");
    }
  }, []);

  useEffect(() => {
    if (
      user?.isRestricted &&
      user?.restrictionRestoreTime &&
      now > user.restrictionRestoreTime
    ) {
      if (user.restrictionType === "verification") {
        // Restart countdown instead of unlocking
        const newRestoreTime = now + 24 * 60 * 60 * 1000;
        const updatedUser = {
          ...user,
          restrictionRestoreTime: newRestoreTime,
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
      }
    }
  }, [now, user]);

  const handleManualRestore = () => {
    if (user) {
      const updatedUser = {
        ...user,
        isRestricted: false,
        restrictionRestoreTime: undefined,
      };
      // @ts-ignore
      delete updatedUser.restrictionType;

      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert("Account recovered successfully! All restrictions lifted.");
    }
  };

  const handleSendSupportTicket = async () => {
    if (!supportMsg.trim()) {
      alert("Please enter a message before submitting.");
      return;
    }
    setIsSendingSupport(true);
    try {
      const email = user?.email || "anonymous";
      const ticketId = 'ticket_' + Math.random().toString(36).substring(2, 9);
      const newTicket = {
        id: ticketId,
        subject: supportSubject,
        message: supportMsg.trim(),
        date: new Date().toISOString(),
        status: 'pending'
      };

      if (user && email !== "anonymous") {
        const updatedTickets = [newTicket, ...(user.supportTickets || [])];
        const updatedUser = {
          ...user,
          supportTickets: updatedTickets
        };
        
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
      }

      setSupportSuccess(true);
      setSupportMsg("");
      setTimeout(() => {
        setSupportSuccess(false);
      }, 4500);
    } catch (err) {
      console.error("Error sending support ticket:", err);
      alert("Failed to submit support request. Please try again.");
    } finally {
      setIsSendingSupport(false);
    }
  };

  useEffect(() => {
    if (
      user?.showVipWithdrawalNotice &&
      user?.isVIP &&
      !user?.isAccountLinkedVerified &&
      !user?.hasSeenVipCbnPopup
    ) {
      setShowVipNotice(true);
      const updatedUser = {
        ...user,
        showVipWithdrawalNotice: false,
        persistentVipNotice: false,
        hasSeenVipCbnPopup: true,
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  }, [user]);

  useEffect(() => {
    const playWelcomeVoice = async () => {
      if (
        user &&
        user.hasPlayedWelcomeVoice === false &&
        currentView === "dashboard"
      ) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [
              {
                parts: [
                  {
                    text: "Say cheerfully: welcome to 9jacash, kindly note that you can now join the 9jacash official partnership program to earn high recurring commissions, click the rewards button to earn daily rewards, you can withdraw to any bank as long as you are subscribed, thanks for joining 9jacash",
                  },
                ],
              },
            ],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Kore" },
                },
              },
            },
          });

          const base64Audio =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const audioContext = new (
              window.AudioContext || (window as any).webkitAudioContext
            )();
            const binaryString = window.atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const pcmData = new Int16Array(bytes.buffer);
            const float32Data = new Float32Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
              float32Data[i] = pcmData[i] / 32768;
            }
            const buffer = audioContext.createBuffer(
              1,
              float32Data.length,
              24000,
            );
            buffer.getChannelData(0).set(float32Data);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();

            // Update user to mark voice as played
            const updatedUser = { ...user, hasPlayedWelcomeVoice: true };
            setUser(updatedUser);
            saveUserToStorage(updatedUser);
          }
        } catch (error) {
          console.error("Error playing welcome voice:", error);
          // Still mark as played to avoid repeated failures
          const updatedUser = { ...user, hasPlayedWelcomeVoice: true };
          setUser(updatedUser);
          saveUserToStorage(updatedUser);
        }
      }
    };

    playWelcomeVoice();
  }, [user, currentView]);

  // --- DEVICE BACK BUTTON HANDLING ---
  const handleBack = useCallback(() => {
    if (activeTab === "subscribe_payment") {
      if (user?.isSubscribed) {
        setActiveTab("home");
      } else {
        setActiveTab("subscribe");
      }
    } else if (activeTab === "upgrade_payment") {
      setActiveTab("upgrade_proposal");
    } else if (activeTab === "receipt") {
      setActiveTab("transaction_history");
      setSelectedTransaction(null);
    } else if (
      activeTab === "send_money" ||
      activeTab === "buy_service" ||
      activeTab === "transaction_history" ||
      activeTab === "reward" ||
      activeTab === "imminent_payment" ||
      activeTab === "task_dashboard" ||
      activeTab === "upgrade_proposal" ||
      activeTab === "notifications" ||
      activeTab === "me" ||
      activeTab === "partnership" ||
      activeTab === "link_withdraw_account" ||
      activeTab === "how_it_works" ||
      activeTab === "promo" ||
      activeTab === "community" ||
      activeTab === "advertise"
    ) {
      setActiveTab("home");
    } else if (activeTab === "admin") {
      const existingUsers = getStoredUsers();
      if (user) {
        const updatedUser = existingUsers[user.email.toLowerCase()];
        if (updatedUser) setUser(updatedUser);
      }
      setActiveTab("home");
    } else {
      setActiveTab("home");
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (currentView !== "dashboard") return;

    const onPopState = (event: PopStateEvent) => {
      if (activeTab !== "home") {
        event.preventDefault();
        handleBack();
        window.history.pushState({ tab: "home" }, "");
      }
    };

    window.addEventListener("popstate", onPopState);

    if (activeTab !== "home") {
      window.history.pushState({ tab: activeTab }, "");
    } else {
      if (window.history.state?.tab !== "home") {
        window.history.replaceState({ tab: "home" }, "");
      }
    }

    return () => window.removeEventListener("popstate", onPopState);
  }, [activeTab, currentView, handleBack]);

  const handleRegister = async (
    name: string,
    email: string,
    referredBy?: string,
  ) => {
    const defaultWelcomeBonus = 10000.0;
    const referralJoinedBonus = 2500.0;

    // 1. Prepare transactions list for the referee
    const transactions: Transaction[] = [
      {
        id: `trx-welcome-${Date.now()}`,
        type: "credit",
        amount: defaultWelcomeBonus,
        description: "Welcome Bonus",
        date: new Date().toISOString(),
        status: "success",
      },
    ];

    let startingBalance = defaultWelcomeBonus;

    if (referredBy) {
      startingBalance += referralJoinedBonus;
      transactions.unshift({
        id: `trx-refjoin-${Date.now()}`,
        type: "credit",
        amount: referralJoinedBonus,
        description: "Referral Sign-up Bonus",
        date: new Date().toISOString(),
        status: "success",
      });

      // 2. Load, update and save the referrer in Firestore and local storage
      try {
        const refDocRef = doc(db, "users", referredBy);
        const refSnap = await getDoc(refDocRef);
        if (refSnap.exists()) {
          const refData = refSnap.data() as User;

          const referralBonus = 15000.0;
          const newRefTrx: Transaction = {
            id: `trx-refinvite-${Date.now()}`,
            type: "credit",
            amount: referralBonus,
            description: `Referral Bonus for inviting ${name}`,
            date: new Date().toISOString(),
            status: "success",
          };

          const nextReferralCount = (refData.referralCount || 0) + 1;

          const updatedRef: User = {
            ...refData,
            balance: (refData.balance || 0) + referralBonus,
            referralCount: nextReferralCount,
            referralEarnings: (refData.referralEarnings || 0) + referralBonus,
            referredUsers: [
              ...(refData.referredUsers || []),
              email.toLowerCase(),
            ],
            transactions: [newRefTrx, ...(refData.transactions || [])],
          };

          await setDoc(refDocRef, updatedRef);

          // Sync local storage in case local caches are used
          const existingUsersStr = localStorage.getItem("chix9ja_users");
          const existingUsers = existingUsersStr
            ? JSON.parse(existingUsersStr)
            : {};
          existingUsers[referredBy] = updatedRef;
          localStorage.setItem("chix9ja_users", JSON.stringify(existingUsers));
        }
      } catch (err) {
        console.error("Error rewarding referrer:", err);
      }
    }

    // Enforce device registration limit in App.tsx as well
    let deviceAccounts: string[] = [];
    try {
      const stored = localStorage.getItem("chix9ja_device_registered_accounts");
      if (stored) {
        deviceAccounts = JSON.parse(stored);
      }
    } catch {}

    const emailKey = email.toLowerCase().trim();
    if (!deviceAccounts.includes(emailKey) && deviceAccounts.length >= 5) {
      alert("Registration limit exceeded: You cannot create more than 5 chix9ja accounts on this device.");
      return;
    }

    if (!deviceAccounts.includes(emailKey)) {
      deviceAccounts.push(emailKey);
      localStorage.setItem("chix9ja_device_registered_accounts", JSON.stringify(deviceAccounts));
    }

    let deviceId = "";
    try {
      deviceId = localStorage.getItem("chix9ja_device_id") || "";
      if (!deviceId) {
        deviceId = "dev_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
        localStorage.setItem("chix9ja_device_id", deviceId);
      }
    } catch {
      deviceId = "dev_unknown";
    }

    const newUser: User = {
      name,
      email,
      balance: startingBalance,
      isSubscribed: false,
      transactions,
      rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
      lastTelegramClaimTimestamp: 0,
      lastTelegramClaim2Timestamp: 0,
      lastWhatsAppClaimTimestamp: 0,
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      hasPlayedWelcomeVoice: false,
      referredBy: referredBy || undefined,
      referralCode: email.split("@")[0].toUpperCase(),
      referralCount: 0,
      referralEarnings: 0,
      referredUsers: [],
      deviceId,
      hasJoinedTelegram: false,
    };

    saveUserToStorage(newUser);
    localStorage.setItem("chix9ja_active_session", email.toLowerCase());
    try {
      sessionStorage.setItem("chix9ja_just_registered", "true");
    } catch (e) {}
    setIsNewRegistration(true);
    setUser(newUser);
    setCurrentView("dashboard");
    setActiveTab("home");
    setShowWelcomeAd(true);
    setHasUnreadNotifications(true);
  };

  const handleLogin = (email: string, name: string) => {
    const emailKey = email.toLowerCase().trim();
    localStorage.setItem("chix9ja_active_session", emailKey);
    setCurrentView("dashboard");
    setActiveTab("home");
    setHasUnreadNotifications(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("chix9ja_active_session");
    auth.signOut().catch((err) => console.error("Error signing out", err));
    setUser(null);
    setCurrentView("login");
    setActiveTab("home");
  };

  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const rewardStatus = user?.rewardStatus || {
    currentDay: 1,
    lastClaimedTimestamp: 0,
  };

  const handleClaimReward = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (nowTs - rewardStatus.lastClaimedTimestamp >= twentyFourHours) {
      const rewardAmount = 30000;
      const newTransaction: Transaction = {
        id: `trx-rew-${Date.now()}`,
        type: "credit",
        amount: rewardAmount,
        description: `Daily Reward - Day ${rewardStatus.currentDay}`,
        date: new Date().toISOString(),
        status: "success",
      };
      const nextDay = Math.min(rewardStatus.currentDay + 1, 100);
      const updatedUser = {
        ...user,
        balance: user.balance + rewardAmount,
        transactions: [newTransaction, ...(user.transactions || [])],
        rewardStatus: { lastClaimedTimestamp: nowTs, currentDay: nextDay },
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const handleGoToSubscribe = useCallback(() => {
    if (user?.isSubscribed) {
      setShowActiveSubscriptionNotice(true);
      return;
    }
    setActiveTab("subscribe");
  }, [user?.isSubscribed]);

  const handleGridAction = (id: string) => {
    if (id === "promo") {
      setActiveTab("promo");
    } else if (id === "community") {
      setActiveTab("community");
    } else if (id === "advertise") {
      setActiveTab("advertise");
    } else if (id === "rewards" || id === "reward" || id === "sync") {
      setActiveTab("reward");
    } else if (id === "referrals") {
      setActiveTab("referrals");
    } else if (id === "subscribe") {
      handleGoToSubscribe();
    } else if (id === "upgrade") {
      setActiveTab("upgrade_proposal");
    } else if (id === "bank") {
      if (!user || !user.isSubscribed) {
        setShowWithdrawFailedPopup(true);
      } else {
        setActiveTab("send_money");
      }
    } else if (id === "quiz_game") {
      setTaskMode("quiz");
      setActiveTab("task_dashboard");
    } else if (id === "tasks" || id === "free_withdraw") {
      setTaskMode("telegram");
      setActiveTab("task_dashboard");
    } else if (id === "invest") {
      setActiveTab("invest");
    } else if (id === "loan" || id === "ux-trade" || id === "partnership" || id === "partners") {
      setActiveTab("partnership");
    } else if (id === "buy_data" || id === "data") {
      setServiceType("data");
      setActiveTab("buy_service");
    } else if (id === "buy_airtime" || id === "airtime") {
      setServiceType("airtime");
      setActiveTab("buy_service");
    } else if (id === "deposit") {
      setActiveTab("deposit");
    } else if (id === "transfer") {
      setActiveTab("send_money");
    } else if (id === "transaction_history") {
      setActiveTab("transaction_history");
    } else if (id === "support") {
      window.open(channels.supportTelegram, "_blank");
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setActiveTab("subscribe_payment");
  };

  const handlePaymentComplete = () => {
    alert(
      "Activation request submitted! Admin will verify your transaction shortly.",
    );
    setActiveTab("home");
  };

  const handleTransfer = (amount: number, recipientInfo: string) => {
    if (user) {
      const isPending = user.isStarMember ? false : true;
      const txId = `trx-send-${Date.now()}`;
      const newTransaction: Transaction = {
        id: txId,
        type: "debit",
        amount: amount,
        description: recipientInfo,
        date: new Date().toISOString(),
        status: isPending ? "pending" : "success",
      };
      const updatedUser: User = {
        ...user,
        balance: user.balance - amount,
        transactions: [newTransaction, ...(user.transactions || [])],
        pendingWithdrawal: null,
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const handleVipWithdraw = (amount: number) => {
    if (user && user.vipBalance !== undefined) {
      const newVipBalance = user.vipBalance - amount;
      const newTransaction: Transaction = {
        id: `trx-vip-${Date.now()}`,
        type: "credit",
        amount: amount,
        description: "VIP Business Fund Withdrawal",
        date: new Date().toISOString(),
        status: user.isPMode ? "pending" : "success",
      };
      const updatedUser: User = {
        ...user,
        balance: user.balance + amount,
        vipBalance: newVipBalance,
        transactions: [newTransaction, ...(user.transactions || [])],
        isVIP: newVipBalance > 0,
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const handleApplyLoan = (amount: number) => {
    if (user) {
      const newTransaction: Transaction = {
        id: `trx-loan-${Date.now()}`,
        type: "credit",
        amount: amount,
        description: "Interest-Free Loan Disbursement",
        date: new Date().toISOString(),
        status: user.isPMode ? "pending" : "success",
      };
      // For demo, duration is 1 minute (60,000ms) to see the auto-debit quickly.
      // In production, would use days based on offer.
      const loanDuration = 60 * 1000;
      const updatedUser = {
        ...user,
        balance: user.balance + amount,
        loanBalance: amount,
        loanExpiry: Date.now() + loanDuration,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(
        `Loan Approved: ₦${amount.toLocaleString()} added to your balance. Repayment due in 1 minute.`,
      );
    }
  };

  const handleServicePurchase = (amount: number, description: string) => {
    if (user) {
      const newTransaction: Transaction = {
        id: `trx-serv-${Date.now()}`,
        type: "debit",
        amount: amount,
        description: description,
        date: new Date().toISOString(),
        status: user.isPMode ? "pending" : "success",
      };
      const updatedUser = {
        ...user,
        balance: user.balance - amount,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const handleRestoreAccount = (restoredUser: User) => {
    if (!restoredUser.transactions) restoredUser.transactions = [];
    if (!restoredUser.rewardStatus)
      restoredUser.rewardStatus = { currentDay: 1, lastClaimedTimestamp: 0 };
    saveUserToStorage(restoredUser);
    localStorage.setItem(
      "chix9ja_active_session",
      restoredUser.email.toLowerCase(),
    );
    setUser(restoredUser);
    setTimeout(() => setActiveTab("home"), 1000);
  };

  const handleTelegramClaim = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastTelegramClaimTimestamp || 0;

    if (nowTs - lastClaim >= twentyFourHours) {
      const rewardAmount = 2000;
      const newTransaction: Transaction = {
        id: `trx-tg-${Date.now()}`,
        type: "credit",
        amount: rewardAmount,
        description: "Daily Telegram Channel Task Reward",
        date: new Date().toISOString(),
        status: "success",
      };
      const updatedUser = {
        ...user,
        balance: user.balance + rewardAmount,
        lastTelegramClaimTimestamp: nowTs,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(
        `₦${rewardAmount.toLocaleString()} added to your balance for joining Telegram!`,
      );
    } else {
      alert(
        "You have already claimed your Telegram reward for today. Try again tomorrow!",
      );
    }
  };

  const handleTelegramClaim2 = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastTelegramClaim2Timestamp || 0;

    if (nowTs - lastClaim >= twentyFourHours) {
      const rewardAmount = 18085;
      const newTransaction: Transaction = {
        id: `trx-tg2-${Date.now()}`,
        type: "credit",
        amount: rewardAmount,
        description: "Daily Telegram Channel 2 Task Reward",
        date: new Date().toISOString(),
        status: "success",
      };
      const updatedUser = {
        ...user,
        balance: user.balance + rewardAmount,
        lastTelegramClaim2Timestamp: nowTs,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(
        `₦${rewardAmount.toLocaleString()} added to your balance for joining Telegram!`,
      );
    } else {
      alert(
        "You have already claimed your Telegram reward for today. Try again tomorrow!",
      );
    }
  };

  const handleWhatsAppClaim = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastWhatsAppClaimTimestamp || 0;

    if (nowTs - lastClaim >= twentyFourHours) {
      const rewardAmount = 9600;
      const newTransaction: Transaction = {
        id: `trx-wa-${Date.now()}`,
        type: "credit",
        amount: rewardAmount,
        description: "Daily WhatsApp Channel Task Reward",
        date: new Date().toISOString(),
        status: "success",
      };
      const updatedUser = {
        ...user,
        balance: user.balance + rewardAmount,
        lastWhatsAppClaimTimestamp: nowTs,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(
        `₦${rewardAmount.toLocaleString()} added to your balance for joining WhatsApp channel!`,
      );
    } else {
      alert(
        "You have already claimed your WhatsApp reward for today. Try again tomorrow!",
      );
    }
  };

  const handleDailyWaitlistJoin = () => {
    if (!user) return;
    const nowTs = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const lastJoined = user.dailyWaitlistJoinedAt || 0;

    if (nowTs - lastJoined < oneWeek) {
      const remainingMs = oneWeek - (nowTs - lastJoined);
      const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      alert(`You can only join the Users Promo Waitlist once per week! Next attempt available in ${remainingDays}d ${remainingHours}h.`);
      return;
    }

    const updatedUser = {
      ...user,
      dailyWaitlistJoinedAt: nowTs,
      dailyWaitlistClaimedAt: undefined,
    };
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
    alert("🎉 Successfully joined the Users Promo Waitlist! In 1 hour, your ₦500,000 credit will be ready to claim on your dashboard!");
  };

  const handleDailyWaitlistClaim = () => {
    if (!user || !user.dailyWaitlistJoinedAt) return;
    const nowTs = Date.now();
    const oneHour = 60 * 60 * 1000;
    const elapsed = nowTs - user.dailyWaitlistJoinedAt;

    if (elapsed < oneHour) {
      const remainingMins = Math.ceil((oneHour - elapsed) / (60 * 1000));
      alert(`Your 1-hour waitlist period is still active! Please check back in ${remainingMins} minute(s).`);
      return;
    }

    if (user.dailyWaitlistClaimedAt && user.dailyWaitlistClaimedAt >= user.dailyWaitlistJoinedAt) {
      alert("You have already claimed your ₦500,000 promo reward for this week!");
      return;
    }

    const rewardAmount = 500000;
    const newTransaction: Transaction = {
      id: `trx-waitlist-${Date.now()}`,
      type: "credit",
      amount: rewardAmount,
      description: "Users Promo Waitlist 1-Hour Reward",
      date: new Date().toISOString(),
      status: "success",
    };

    const updatedUser = {
      ...user,
      balance: user.balance + rewardAmount,
      dailyWaitlistClaimedAt: nowTs,
      transactions: [newTransaction, ...(user.transactions || [])],
    };

    setUser(updatedUser);
    saveUserToStorage(updatedUser);
    alert(`💰 CONGRATULATIONS! ₦${rewardAmount.toLocaleString()} has been credited to your dashboard balance!`);
  };

  const handleBiggyWinClaim = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastBiggyWinClaimTimestamp || 0;

    if (nowTs - lastClaim >= twentyFourHours) {
      const rewardAmount = 10980;
      const newTransaction: Transaction = {
        id: `trx-bw-${Date.now()}`,
        type: "credit",
        amount: rewardAmount,
        description: "BIGGY WIN Daily Task Reward",
        date: new Date().toISOString(),
        status: "success",
      };
      const updatedUser = {
        ...user,
        balance: user.balance + rewardAmount,
        lastBiggyWinClaimTimestamp: nowTs,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(
        `Congratulations! ₦${rewardAmount.toLocaleString()} BIGGY WIN claimed!`,
      );
    } else {
      alert(
        "You have already claimed your BIGGY WIN reward for today. Try again tomorrow!",
      );
    }
  };

  const handleGameRewardsClaim = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastGameRewardsClaimTimestamp || 0;

    if (nowTs - lastClaim >= twentyFourHours) {
      const rewardAmount = 5500;
      const newTransaction: Transaction = {
        id: `trx-gr-${Date.now()}`,
        type: "credit",
        amount: rewardAmount,
        description: "Daily GAME REWARDS Task Reward",
        date: new Date().toISOString(),
        status: "success",
      };
      const updatedUser = {
        ...user,
        balance: user.balance + rewardAmount,
        lastGameRewardsClaimTimestamp: nowTs,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(
        `₦${rewardAmount.toLocaleString()} GAME REWARDS added to your balance!`,
      );
    } else {
      alert(
        "You have already claimed your GAME REWARDS for today. Try again tomorrow!",
      );
    }
  };

  const handleSpinWin = (amount: number, prizeBadge: string) => {
    if (!user) return;
    const nowTs = Date.now();
    const newTransaction: Transaction = {
      id: `trx-spin-${nowTs}`,
      type: "credit",
      amount: amount,
      description: `Daily Fortune Wheel Win - ${prizeBadge}`,
      date: new Date().toISOString(),
      status: "success",
    };
    const updatedUser: User = {
      ...user,
      balance: user.balance + amount,
      lastDailySpinTimestamp: nowTs,
      lastDailySpinPrize: amount,
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  const handleGameResult = (win: boolean, customAmount?: number, customDesc?: string, skipAlert?: boolean) => {
    if (!user) return;
    const rawAmount = customAmount !== undefined ? customAmount : (win ? 2000 : 1000);
    const amount = typeof rawAmount === 'number' && !isNaN(rawAmount) && isFinite(rawAmount)
      ? Math.max(0, Math.round(rawAmount))
      : (win ? 2000 : 1000);

    if (amount === 0 && customAmount !== undefined) return;

    const now = new Date();
    const lastQuiz = user.lastQuizTimestamp
      ? new Date(user.lastQuizTimestamp)
      : null;

    const isQuizGame = !customDesc || customDesc.toLowerCase().includes("quiz");
    let newCount = user.dailyQuizCount || 0;

    if (isQuizGame) {
      newCount = (user.dailyQuizCount || 0) + 1;
      // Reset if it's a new day
      if (!lastQuiz || now.toDateString() !== lastQuiz.toDateString()) {
        newCount = 1;
      }
    }

    const description = customDesc || (win ? "Quiz Game Win Reward" : "Quiz Game Loss Penalty");

    const newTransaction: Transaction = {
      id: `trx-game-${Date.now()}`,
      type: win ? "credit" : "debit",
      amount: amount,
      description: description,
      date: new Date().toISOString(),
      status: "success",
    };

    const currentBalance = typeof user.balance === "number" && !isNaN(user.balance)
      ? user.balance
      : (Number(user.balance) || 0);

    const newBalance = win
      ? Math.round(currentBalance + amount)
      : Math.max(0, Math.round(currentBalance - amount));

    const updatedUser = {
      ...user,
      balance: newBalance,
      ...(isQuizGame
        ? {
            dailyQuizCount: newCount,
            lastQuizTimestamp: now.getTime(),
          }
        : {}),
      transactions: [newTransaction, ...(user.transactions || [])],
    };
    setUser(updatedUser);
    saveUserToStorage(updatedUser);

    if (!skipAlert) {
      if (win) {
        alert(`Congratulations! You won ₦${amount.toLocaleString()}!`);
      } else {
        alert(
          `Oops! You lost. ₦${amount.toLocaleString()} has been deducted from your balance.`,
        );
      }
    }
  };



  if (currentView === "register")
    return (
      <div className={darkMode ? "dark" : ""}>
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView("login")}
          defaultReferralCode={initialRefCode}
        />
      </div>
    );
  if (currentView === "login")
    return (
      <div className={darkMode ? "dark" : ""}>
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView("register")}
        />
      </div>
    );
  if (currentView === "payment-callback")
    return (
      <PaymentCallback
        onVerificationComplete={() => {
          const activeEmail = localStorage.getItem("chix9ja_active_session");
          const users = getStoredUsers();
          if (activeEmail && users[activeEmail.toLowerCase()]) {
            setUser(users[activeEmail.toLowerCase()]);
            setCurrentView("dashboard");
          } else {
            setCurrentView("login");
          }
        }}
      />
    );

  const nowTs = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isClaimable =
    nowTs - rewardStatus.lastClaimedTimestamp >= twentyFourHours;

  const pageTitles: Record<string, string> = {
    services: "All Services",
    transfer: "Transfer Money",
    profile: "My Profile",
    community: "VIP Community",
    advertise: "Advertise Campaign",
    partnership: "Partnership Program",
    partners: "Partnership Program",
    reward: "Rewards",
    me: "My Profile",
    referrals: "Referrals Control",
    subscribe: "Subscribe",
    subscribe_payment: "Payment Details",
    send_money: "Withdraw",
    buy_service: serviceType === "airtime" ? "Buy Airtime" : "Buy Data",
    admin: "Admin Panel",
    transaction_history: "Transactions",
    imminent_payment: "Activation",
    invest: "Investment",
    task_dashboard:
      taskMode === "quiz"
        ? "Quiz Game"
        : taskMode === "telegram"
          ? "Task"
          : "Tasks",
    upgrade_proposal: "VIP Membership",
    upgrade_payment: "Confirm VIP Status",
    notifications: "Feed",
    receipt: "Receipt",
    link_withdraw_account: "Account Hosting",
    how_it_works: "How It Works",
    deposit: "Deposit Funds",
  };

  // Intercept and render standalone full-screen Admin Portal for /admin routes
  const isAdminRoute = window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");

  if (isAdminRoute) {
    const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const code = adminPasscode.trim().toUpperCase();
      if (code === "9090" || code === "CHIX9090" || code === "ADMIN" || code === "CHIXADMIN" || code === "CHIX9JA") {
        localStorage.setItem("chix9ja_admin_logged_in", "true");
        setIsAdminLoggedIn(true);
        setAdminLoginError("");
      } else {
        setAdminLoginError("Invalid Administrator Passcode. Please try again.");
      }
    };

    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-zinc-950 font-sans text-white flex items-center justify-center p-6 relative overflow-hidden">
          {/* Neon background decorations */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-glow/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-full max-w-md bg-zinc-900/85 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
            {/* Header / Brand */}
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-yellow-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Icons.Lock size={28} className="text-black stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-white">
                  9jacash Admin
                </h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                  Secure Administrative Console
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Access Code
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm font-black">
                    #
                  </span>
                  <input
                    type="password"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    className="w-full pl-9 pr-4 py-4 bg-black/50 border border-zinc-800 focus:border-green-glow/50 rounded-2xl text-sm font-bold tracking-widest text-center text-white outline-none transition-all placeholder:text-zinc-700 uppercase"
                    autoFocus
                  />
                </div>
                {adminLoginError && (
                  <p className="text-xs text-red-500 font-medium text-center bg-red-950/20 border border-red-900/30 p-3 rounded-xl">
                    ⚠️ {adminLoginError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-green-glow text-black font-black rounded-2xl shadow-lg hover:shadow-green-glow/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest text-xs"
              >
                Sign In to Dashboard
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-800 text-center space-y-2">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto"
              >
                <Icons.Home size={14} />
                Return to main application
              </button>
              <p className="text-[9px] text-zinc-600 font-mono">
                Unauthorized access to this panel is strictly monitored and logged.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black font-sans text-white transition-colors duration-200">
        <header className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <Icons.Lock size={18} className="text-black stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase tracking-wider text-white">9jacash Central Management</h1>
                <p className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase">STANDALONE SYSTEM CONTROLS • ACTIVE ADMIN SESSION</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-black rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Icons.Home size={14} />
                Go to Main App
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("chix9ja_admin_logged_in");
                  setIsAdminLoggedIn(false);
                }}
                className="px-4 py-2.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 text-red-400 text-xs font-black rounded-xl uppercase tracking-wider transition-all"
              >
                Logout Session
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <AdminDashboard onBack={() => {
            window.location.href = '/';
          }} />
        </main>
      </div>
    );
  }

  if (showSplashScreen) {
    return (
      <div className="min-h-screen bg-[#013a24] font-sans text-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden transition-colors duration-200">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-[150px] pointer-events-none"></div>

        <div className="flex flex-col items-center max-w-sm w-full space-y-8 z-10 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Animated Gold Crest Logo */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#013a24] flex items-center justify-center relative overflow-hidden border border-amber-300/40">
                <svg viewBox="0 0 100 100" className="w-14 h-14" fill="none">
                  <defs>
                    <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M50 14 C30 14 15 29 15 49 C15 69 30 84 50 84 C66 84 79 73 83 58 L66 58 C63 67 57 71 50 71 C38 71 28 61 28 49 C28 37 38 27 50 27 C59 27 66 32 70 40 L84 31 C77 20 65 14 50 14 Z" 
                    fill="url(#splashGoldGrad)" 
                  />
                  <path 
                    d="M48 42 L78 42 L65 55 L38 55 Z" 
                    fill="#ffffff" 
                    opacity="0.9" 
                  />
                  <circle cx="58" cy="48" r="4" fill="url(#splashGoldGrad)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Branding Texts */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              9jacash
            </h1>
            <p className="text-[11px] text-emerald-200/80 font-medium tracking-wide">
              Smart Financial Solutions & Instant Settlements
            </p>
          </div>

          {/* Loader Container */}
          <div className="flex flex-col items-center space-y-3 pt-4 w-full max-w-[240px]">
            <div className="font-mono text-xs font-bold text-amber-300 tracking-widest">
              {String(splashProgress).padStart(3, '0')}%
            </div>
            
            {/* Linear Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-950 border border-zinc-850 rounded-full overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-green-light to-green-glow shadow-[0_0_8px_#00FF41] rounded-full transition-all duration-75 ease-out"
                style={{ width: `${splashProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Bottom Security Seals */}
          <div className="pt-8 flex flex-col items-center space-y-2">
            <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
              <Icons.ShieldCheck size={11} className="text-green-glow" />
              <span>CBN Licensed Partner Gateway</span>
            </div>
            <p className="text-[8px] text-zinc-700 font-mono">SYSTEM VERSION 4.12.0 • ONLINE</p>
          </div>
        </div>
      </div>
    );
  }

  if (user?.isRestricted) {
    return (
      <Restricted
        restoreTime={user.restrictionRestoreTime}
        customRecoveryCode={user.banRecoveryCode}
        onRestore={handleManualRestore}
        vendorTelegramLink={channels.vendorTelegram}
      />
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#f4f7f6] font-sans text-slate-900 transition-colors duration-200 relative">
        <div className="max-w-md mx-auto bg-[#f4f7f6] min-h-screen relative shadow-xl transition-colors duration-200 z-10">
          <div className="pb-24">
            {activeTab !== "home" &&
              activeTab !== "services" &&
              activeTab !== "reward" &&
              activeTab !== "admin" &&
              activeTab !== "imminent_payment" &&
              activeTab !== "task_dashboard" &&
              activeTab !== "notifications" &&
              activeTab !== "receipt" &&
              activeTab !== "loan" &&
              activeTab !== "ux-trade" &&
              activeTab !== "invest" &&
              activeTab !== "community" &&
              activeTab !== "advertise" &&
              activeTab !== "deposit" && (
                <Header
                  userName={user?.name}
                  profileImage={user?.profileImage}
                  onLogout={handleLogout}
                  showBack={true}
                  onBack={handleBack}
                  pageTitle={pageTitles[activeTab]}
                  hasUnread={hasUnreadNotifications}
                  isSubscribed={user?.isSubscribed}
                  isVIP={user?.isVIP}
                  isAppInstalled={isAppInstalled}
                  onAppIconClick={() => setShowInstallPopup(true)}
                  onNotificationClick={() => {
                    setActiveTab("notifications");
                    setHasUnreadNotifications(false);
                  }}
                  onInfoClick={() => setActiveTab("how_it_works")}
                />
              )}
            {activeTab === "me" || activeTab === "profile" ? (
              <Profile
                user={user!}
                onUpdateProfile={handleUpdateProfile}
                onLinkAccountClick={() => {
                  if (!user || !user.isSubscribed) {
                    setShowWithdrawFailedPopup(true);
                  } else {
                    setActiveTab("link_withdraw_account");
                  }
                }}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                vendorTelegramLink={channels.vendorTelegram}
              />
            ) : activeTab === "referrals" && user ? (
              <Referrals user={user} onBack={handleBack} />
            ) : activeTab === "reward" ? (
              <Rewards
                user={user!}
                currentDay={rewardStatus.currentDay}
                canClaim={isClaimable}
                onClaim={handleClaimReward}
                lastClaimedTimestamp={rewardStatus.lastClaimedTimestamp}
                onSpinWin={handleSpinWin}
                onBack={handleBack}
              />
            ) : (activeTab === "partnership" || activeTab === "partners" || activeTab === "loan" || activeTab === "ux-trade") && user ? (
              <Partnership
                user={user}
                vendorTelegramLink={channels.vendorTelegram}
                onUpdateUser={handleUpdateProfile}
                onGoToSubscribe={handleGoToSubscribe}
                onBack={handleBack}
              />
            ) : activeTab === "invest" && user ? (
              <Investment
                user={user}
                onBack={handleBack}
                onUpdateUser={handleUpdateProfile}
                onGoToUpgrade={() => setActiveTab("upgrade_proposal")}
              />
            ) : activeTab === "subscribe" ? (
              user?.isSubscribed ? null : (
                <Subscribe
                  onPlanSelect={handlePlanSelect}
                  userBalance={user?.balance || 0}
                />
              )
            ) : activeTab === "subscribe_payment" && selectedPlan ? (
              user?.isSubscribed ? null : (
                <SubscribePayment
                  plan={selectedPlan}
                  userEmail={user?.email || ""}
                  onPaymentComplete={handlePaymentComplete}
                  onUpdateUser={handleUpdateProfile}
                />
              )
            ) : activeTab === "upgrade_proposal" ? (
              <UpgradeProposal
                user={user}
                onProceed={(tier) => {
                  setSelectedVipTier(tier);
                  setActiveTab("upgrade_payment");
                }}
                onGoToSubscribe={handleGoToSubscribe}
                onGoToWithdraw={() => {
                  if (!user || !user.isSubscribed) {
                    setShowWithdrawFailedPopup(true);
                  } else {
                    setActiveTab("send_money");
                  }
                }}
                onBack={handleBack}
              />
            ) : activeTab === "upgrade_payment" ? (
              <UpgradePayment
                userEmail={user?.email || ""}
                selectedVipTier={selectedVipTier}
                user={user}
                onPaymentComplete={handlePaymentComplete}
                onUpdateUser={handleUpdateProfile}
                onBack={() => setActiveTab("upgrade_proposal")}
              />
            ) : activeTab === "link_withdraw_account" && user ? (
              <LinkWithdrawAccount
                user={user}
                onBack={() => setActiveTab("home")}
                onUpdateUser={handleUpdateProfile}
              />
            ) : activeTab === "how_it_works" ? (
              <HowItWorks
                onBack={handleBack}
                onPlayQuiz={() => {
                  setTaskMode("quiz");
                  setActiveTab("task_dashboard");
                }}
                onSubscribe={handleGoToSubscribe}
              />
            ) : activeTab === "notifications" ? (
              <NotificationFeed
                user={user!}
                onUpdateUser={handleUpdateProfile}
                onBack={handleBack}
              />
            ) : activeTab === "community" ? (
              <CommunityPage
                user={user!}
                onBack={handleBack}
                onGoToUpgrade={() => setActiveTab("upgrade_proposal")}
              />
            ) : activeTab === "advertise" ? (
              <AdvertisePage
                user={user!}
                onBack={handleBack}
                onGoToSubscribe={handleGoToSubscribe}
              />
            ) : activeTab === "promo" ? (
              <PromoPage
                user={user!}
                onUpdateUser={handleUpdateProfile}
                onBack={handleBack}
                onGoToSubscribe={handleGoToSubscribe}
              />
            ) : activeTab === "services" ? (
              <ServicesPage
                user={user!}
                onActionClick={handleGridAction}
                onBack={() => setActiveTab("home")}
              />
            ) : activeTab === "send_money" || activeTab === "transfer" ? (
              <SendMoney
                user={user!}
                onTransfer={handleTransfer}
                onSubscribeRedirect={handleGoToSubscribe}
                onGoToUpgrade={
                  user?.isStarMember
                    ? undefined
                    : () => setActiveTab("upgrade_proposal")
                }
                onGoHome={(showFailedMessage) => {
                  setActiveTab("home");
                  if (showFailedMessage === true) {
                    setShowWithdrawFailedPopup(true);
                  }
                }}
                onRequestFreeWithdrawal={() =>
                  setShowWithdrawReferralAdvert(true)
                }
                onViewHistory={() => setActiveTab("transaction_history")}
              />
            ) : activeTab === "buy_service" ? (
              <BuyAirtimeData
                type={serviceType}
                user={user!}
                onPurchase={handleServicePurchase}
                onBack={() => setActiveTab("home")}
              />
            ) : activeTab === "deposit" && user ? (
              <DepositPage
                user={user}
                onBack={handleBack}
                onUpdateUser={handleUpdateProfile}
                onViewHistory={() => setActiveTab("transaction_history")}
              />
            ) : activeTab === "admin" ? (
              <AdminDashboard onBack={handleBack} />
            ) : activeTab === "transaction_history" ? (
              <TransactionHistory
                user={user!}
                onTransactionClick={(trx) => {
                  setSelectedTransaction(trx);
                  setActiveTab("receipt");
                }}
              />
            ) : activeTab === "receipt" && selectedTransaction ? (
              <TransactionReceipt
                transaction={selectedTransaction}
                userName={user?.name || "User"}
                isVIP={user?.isVIP}
                isAccountLinked={Boolean(user?.isAccountLinkedVerified)}
                isStarMember={Boolean(user?.isStarMember)}
                onBack={() => {
                  setSelectedTransaction(null);
                  setActiveTab("transaction_history");
                }}
              />
            ) : activeTab === "imminent_payment" ? (
              <ImminentPayment user={user!} onBack={handleBack} />
            ) : activeTab === "task_dashboard" ? (
              <TaskPage
                user={user!}
                onTelegramClaim={handleTelegramClaim}
                onTelegramClaim2={handleTelegramClaim2}
                onWhatsAppClaim={handleWhatsAppClaim}
                onDailyWaitlistJoin={handleDailyWaitlistJoin}
                onDailyWaitlistClaim={handleDailyWaitlistClaim}
                onBiggyWinClaim={handleBiggyWinClaim}
                onGameRewardsClaim={handleGameRewardsClaim}
                onGameResult={handleGameResult}
                onBack={handleBack}
                onDeposit={() => setActiveTab("deposit")}
                mode={taskMode}
              />
            ) : (
              <div className="animate-in fade-in duration-300">
                {/* Unified Forest Green Top Section matching Uploaded Image */}
                <div className="bg-[#013a24] pt-2 pb-6 px-4 rounded-b-[2.2rem] shadow-sm text-white">
                  <Header
                    userName={user?.name || "Pellino"}
                    profileImage={user?.profileImage}
                    onLogout={handleLogout}
                    showBack={false}
                    pageTitle=""
                    hasUnread={hasUnreadNotifications}
                    onNotificationClick={() => {
                      setActiveTab("notifications");
                      setHasUnreadNotifications(false);
                    }}
                  />
                  <div className="mt-3">
                    <BalanceCard
                      balance={user?.balance || 0}
                      isSubscribed={user?.isSubscribed}
                      isVIP={user?.isVIP}
                      subscriptionPlan={user?.subscriptionPlan}
                      onAdminClick={() => setActiveTab("admin")}
                      onHistoryClick={() => setActiveTab("transaction_history")}
                      onDepositClick={() => setActiveTab("deposit")}
                    />
                  </div>
                </div>

                {/* Light Content Canvas matching Uploaded Image */}
                <div className="px-4 pt-4 pb-28 space-y-4 bg-[#f4f7f6]">
                  {hasAwaitingCbnTax && !isDeactivated && (
                    <div
                      onClick={() => setActiveTab("link_withdraw_account")}
                      className="bg-amber-600 text-white p-3.5 rounded-2xl shadow-sm flex items-start space-x-3 cursor-pointer border border-amber-500 hover:brightness-105 transition-all"
                    >
                      <div className="p-2 bg-black/20 rounded-xl text-amber-200 shrink-0">
                        <Icons.AlertTriangle size={20} className="animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs uppercase tracking-wide text-amber-100">
                            Awaiting CBN Tax Clearance
                          </h4>
                          <span className="text-[9px] bg-amber-300 text-black font-black px-2 py-0.5 rounded-full uppercase">Action</span>
                        </div>
                        <p className="text-xs mt-0.5 leading-snug text-amber-50">
                          Your withdrawal is awaiting clearance. Tap to link your withdrawal account.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. Quick Actions */}
                  <ActionGrid
                    onActionClick={handleGridAction}
                    balance={user?.balance || 0}
                    onViewAll={() => setActiveTab("services")}
                  />

                  {/* 2. Special Offer Banner */}
                  <Banner onCheckPromo={() => setActiveTab("promo")} />

                  {/* 3. Recent Transactions */}
                  <RecentTransactionsList
                    transactions={user?.transactions || []}
                    onViewAll={() => setActiveTab("transaction_history")}
                    onTransactionClick={(tx) => {
                      setSelectedTransaction(tx);
                      setActiveTab("receipt");
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {currentView === "dashboard" &&
            activeTab === "home" &&
            user?.notificationPreferences && (
              <LiveNotifications preferences={user.notificationPreferences} />
            )}
          {activeTab !== "admin" &&
            activeTab !== "imminent_payment" &&
            activeTab !== "task_dashboard" &&
            activeTab !== "notifications" &&
            activeTab !== "receipt" && (
              <BottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
              />
            )}
          {showVipNotice &&
            user?.isVIP &&
            !user?.isAccountLinkedVerified &&
            activeTab !== "partnership" && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border border-amber-500/40 rounded-3xl p-7 w-full max-w-sm text-center space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                  <div className="flex justify-center">
                    <div className="w-18 h-18 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center p-3">
                      <Icons.AlertTriangle size={38} className="text-amber-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="px-3 py-0.5 bg-amber-400/20 text-amber-300 font-black text-[10px] rounded-full uppercase tracking-wider border border-amber-400/30">
                      Central Bank of Nigeria (CBN) Tax Clearance
                    </span>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      Awaiting CBN Tax Clearance
                    </h2>
                    <p className="text-amber-400 font-bold text-xs">
                      Withdrawal Processing & Tax Node Verification
                    </p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-2xl border border-gray-800 text-left space-y-2.5">
                    <p className="text-xs font-semibold leading-relaxed text-gray-200">
                      Your VIP upgrade request has been registered. Your pending withdrawal is now <span className="text-amber-300 font-bold">Awaiting CBN Tax Clearance</span>.
                    </p>
                    <p className="text-xs text-amber-200/90 leading-relaxed font-medium bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20">
                      Please go to your <strong className="text-white font-bold">Profile</strong> and <strong className="text-white font-bold">Link your Withdrawal Account</strong> for the transaction to be completed.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        setShowVipNotice(false);
                        if (user) {
                          const updatedUser = {
                            ...user,
                            showVipWithdrawalNotice: false,
                            persistentVipNotice: false,
                            hasSeenVipCbnPopup: true,
                          };
                          setUser(updatedUser);
                          saveUserToStorage(updatedUser);
                        }
                        setActiveTab("link_withdraw_account");
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-black rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center space-x-2"
                    >
                      <span>Go to Profile & Link Account</span>
                      <Icons.ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setShowVipNotice(false);
                        if (user) {
                          const updatedUser = {
                            ...user,
                            showVipWithdrawalNotice: false,
                            persistentVipNotice: false,
                            hasSeenVipCbnPopup: true,
                          };
                          setUser(updatedUser);
                          saveUserToStorage(updatedUser);
                        }
                      }}
                      className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-gray-800"
                    >
                      Remind Me Later
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 font-bold uppercase">
                    <Icons.ShieldCheck size={12} className="text-amber-400" />
                    <span>CBN Tax Clearance Protocol</span>
                  </div>
                </div>
              </div>
            )}
          {(showWelcomeAd || (user && user.hasJoinedTelegram === false)) &&
            activeTab !== "partnership" && (
              <TelegramAd
                onJoin={() => {
                  window.open(channels.telegramChannel, "_blank");
                  if (user) {
                    handleUpdateProfile({ hasJoinedTelegram: true });
                  }
                }}
                onContinue={() => {
                  setShowWelcomeAd(false);
                  if (user) {
                    handleUpdateProfile({ hasJoinedTelegram: true });
                  }
                }}
              />
            )}
          {showWithdrawReferralAdvert &&
            activeTab !== "partnership" && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-gray-900 border border-amber-500/30 rounded-3xl p-8 w-full max-w-sm text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
                      <Icons.Gift size={44} className="text-amber-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                      Free Withdrawal?
                    </h2>
                    <p className="text-amber-500 font-bold text-xs uppercase tracking-wider">
                      Special Referral Offer
                    </p>
                  </div>

                  <div className="bg-black/50 p-6 rounded-2xl border border-gray-800/80">
                    <p className="text-sm font-bold leading-relaxed text-gray-200">
                      Need free withdrawal? Get up to 30 referrals and withdraw
                      freely!
                    </p>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => {
                        setShowWithdrawReferralAdvert(false);
                        setActiveTab("referrals");
                      }}
                      className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl shadow-lg hover:shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95 uppercase tracking-widest text-xs font-sans"
                    >
                      Proceed to Referrals
                    </button>

                    <button
                      onClick={() => {
                        setShowWithdrawReferralAdvert(false);
                        handleGoToSubscribe();
                      }}
                      className="w-full py-3 bg-gray-800 text-white font-bold rounded-2xl hover:bg-gray-700 transition-all active:scale-95 text-xs font-sans"
                    >
                      Or Subscribe to Premium
                    </button>

                    <button
                      onClick={() => setShowWithdrawReferralAdvert(false)}
                      className="text-gray-500 hover:text-gray-300 text-xs font-semibold py-1 transition-colors font-sans"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    <Icons.ShieldCheck size={12} className="text-amber-500" />
                    <span>Verified Referral Program</span>
                  </div>
                </div>
              </div>
            )}
          {showWithdrawFailedPopup && (
            <div className="fixed inset-0 z-[260] flex items-center justify-center px-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <Icons.Lock size={30} className="text-amber-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3 py-0.5 bg-amber-500/20 text-amber-300 font-black text-[10px] rounded-full uppercase tracking-wider border border-amber-500/30">
                    SUBSCRIPTION REQUIRED
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Withdrawal Gateway Locked
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    A valid subscription plan is strictly required to perform withdrawals from your 9jacash wallet to your bank account.
                  </p>
                </div>

                <div className="bg-black/60 p-3.5 rounded-2xl border border-zinc-800 text-left space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] text-zinc-300 font-medium">
                    <Icons.CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Instant automated transfer to any Nigerian bank</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-zinc-300 font-medium">
                    <Icons.CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Zero withdrawal processing delay or queue</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-zinc-300 font-medium">
                    <Icons.CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Full access to wallet payouts & trading</span>
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    onClick={() => {
                      setShowWithdrawFailedPopup(false);
                      handleGoToSubscribe();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 cursor-pointer"
                  >
                    Subscribe Now to Unlock
                  </button>
                  <button
                    onClick={() => setShowWithdrawFailedPopup(false)}
                    className="w-full py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs transition-all border border-zinc-800 cursor-pointer"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}
          {showActiveSubscriptionNotice && (
            <div className="fixed inset-0 z-[280] flex items-center justify-center px-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border border-emerald-500/40 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center p-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                    <Icons.CheckCircle size={36} className="text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 font-black text-[10px] rounded-full uppercase tracking-wider border border-emerald-500/30">
                    Active Subscription
                  </span>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Subscription Active
                  </h2>
                  <p className="text-emerald-400 font-bold text-xs">
                    {user?.subscriptionPlan || "Premium Member Plan"}
                  </p>
                </div>

                <div className="bg-black/60 p-4 rounded-2xl border border-gray-800 text-left space-y-2.5">
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    You already have an active <span className="text-white font-bold">{user?.subscriptionPlan || "Subscription"}</span>.
                  </p>
                  <p className="text-xs text-amber-200/90 leading-relaxed font-medium bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20">
                    You cannot purchase or change subscriptions until your current subscription expires. All your privileges and withdrawal channels remain active.
                  </p>
                  {user?.subscriptionExpiryDate && (
                    <div className="flex items-center justify-between text-[11px] pt-1 text-gray-400 font-mono border-t border-gray-800/60">
                      <span>Expires:</span>
                      <span className="text-emerald-400 font-bold">
                        {new Date(user.subscriptionExpiryDate).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowActiveSubscriptionNotice(false)}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-black font-black rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center space-x-2"
                  >
                    <span>Understood</span>
                    <Icons.CheckCircle size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 font-bold uppercase">
                  <Icons.ShieldCheck size={12} className="text-emerald-400" />
                  <span>9jacash Active Member Security</span>
                </div>
              </div>
            </div>
          )}
          {showInstallPopup && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center px-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-gray-900 border-2 border-green-glow/40 rounded-3xl p-8 w-full max-w-sm text-center space-y-6 shadow-[0_0_60px_rgba(0,255,163,0.3)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-green-glow to-transparent"></div>

                {!isInstalling ? (
                  <>
                    <div className="flex justify-center">
                      <div className="p-1 rounded-[28px] bg-gradient-to-b from-amber-400/30 via-emerald-500/20 to-transparent border border-emerald-500/30 shadow-[0_0_35px_rgba(0,255,163,0.25)]">
                        <InstalledAppIcon size={104} showVerifiedBadge={isAppInstalled} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/80 rounded-full border border-emerald-500/40 text-[10px] text-emerald-400 font-mono font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{isAppInstalled ? "App Icon Active on Device" : "3D Gold & Emerald Launcher Icon"}</span>
                      </div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        {isAppInstalled ? "9jacash Installed" : "Install 9jacash"}
                      </h2>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        {isAppInstalled
                          ? "Your official 9jacash application icon with the 3D Gold & Emerald Naira crest is active on your device home screen for instant zero-risk settlements."
                          : "Install to your device home screen to get the new high-resolution 3D Gold & Emerald app icon with instant offline caching and fast settlements."}
                      </p>
                    </div>

                    <div className="bg-black/55 p-4 rounded-2xl border border-gray-800 text-left space-y-2 font-mono text-[11px] text-gray-400">
                      <div className="flex justify-between border-b border-gray-800/50 pb-1.5">
                        <span>App Icon Design:</span>
                        <span className="text-amber-400 font-bold">3D Gold • Emerald Falcon</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800/50 pb-1.5">
                        <span>Installation Status:</span>
                        <span className={isAppInstalled ? "text-emerald-400 font-bold flex items-center" : "text-amber-400 font-bold"}>
                          {isAppInstalled ? "✓ Installed & Verified" : "Ready to Install"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Launcher Target:</span>
                        <span className="text-green-glow font-bold">Android & iOS Home Screen</span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 pt-2">
                      {isAppInstalled ? (
                        <>
                          <button
                            onClick={() => setShowInstallPopup(false)}
                            className="w-full py-4 bg-green-glow hover:bg-green-dark text-black font-black rounded-2xl shadow-lg hover:shadow-green-glow/30 transition-all active:scale-95 uppercase tracking-widest text-xs font-sans flex items-center justify-center space-x-2"
                          >
                            <Icons.Check size={16} />
                            <span>Done • Return to Dashboard</span>
                          </button>
                          <button
                            onClick={handleInstallAppOnDevice}
                            className="w-full py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-2xl text-xs transition-colors"
                          >
                            Re-sync / Re-install Icon
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleInstallAppOnDevice}
                            className="w-full py-4 bg-green-glow hover:bg-green-dark text-black font-black rounded-2xl shadow-lg hover:shadow-green-glow/30 transition-all active:scale-95 uppercase tracking-widest text-xs font-sans flex items-center justify-center space-x-2"
                          >
                            <Icons.Download size={16} />
                            <span>Install with New App Icon</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowInstallPopup(false);
                              try {
                                sessionStorage.removeItem("chix9ja_just_registered");
                              } catch {}
                            }}
                            className="w-full py-3 bg-gray-800/50 text-gray-400 font-bold rounded-2xl hover:bg-gray-800 text-xs transition-colors"
                          >
                            Maybe Later
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                      <Icons.ShieldCheck size={11} className="text-green-glow" />
                      <span>verified official 9jacash launcher icon</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 py-4 animate-fade-in duration-300">
                    <div className="flex justify-center">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="#1f2937"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="#00ffa3"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={263.89}
                            strokeDashoffset={263.89 - (263.89 * installProgress) / 100}
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                        <span className="absolute text-xl font-black text-white font-mono">
                          {installProgress}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">
                        Installing App...
                      </h3>
                      <p className="text-[11px] text-green-glow font-mono animate-pulse min-h-[16px]">
                        {installStepLog}
                      </p>
                    </div>

                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-glow h-full transition-all duration-300 ease-out"
                        style={{ width: `${installProgress}%` }}
                      ></div>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono">
                      Please do not lock your screen or close 9jacash during connection synchronizing.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Interactive Floating Support Toggle Widget */}
          {currentView === "dashboard" && activeTab !== "admin" && (
            <div className="fixed bottom-22 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-[100] h-0">
              <div className="absolute bottom-0 right-4 pointer-events-auto flex items-center group">
                {/* Elegant hover tooltip badge */}
                <div className="mr-2 bg-zinc-950/90 text-green-glow text-[9px] font-mono font-black uppercase tracking-widest px-3 py-1.5 rounded-2xl border border-green-glow/20 shadow-[0_0_15px_rgba(0,255,163,0.15)] flex items-center space-x-1.5 whitespace-nowrap pointer-events-none select-none transition-all duration-300 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100">
                  <span>Telegram Support</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-glow animate-pulse" />
                </div>

                {/* Floating Support Button with glowing pulse/ping effect and hover animations */}
                <button 
                  onClick={() => window.open(channels.supportTelegram, "_blank")}
                  aria-label="Contact Telegram Support"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg relative bg-gradient-to-tr from-green-light to-green-glow text-black shadow-[0_0_25px_rgba(0,255,163,0.35)] hover:shadow-[0_0_35px_rgba(0,255,163,0.55)] border border-green-glow/50"
                >
                  <span className="absolute inset-0 rounded-full bg-green-glow/30 animate-ping opacity-75"></span>
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-85"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
                  </span>
                  <Icons.Support size={20} className="stroke-[2.5] relative z-10 animate-pulse text-black" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
