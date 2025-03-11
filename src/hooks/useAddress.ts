"use client";

import { useEffect } from "react";
import { useState } from "react";
import Cookies from "js-cookie";

export const useAddress = () => {
  const [address, setAddress] = useState<string | undefined>(Cookies.get("address"));

  useEffect(() => {
    console.log("Initial cookie value:", Cookies.get("address"));
    console.log("Initial address state:", address);

    // Update initial value
    setAddress(Cookies.get("address"));

    // Listen for custom event when cookie changes
    const handleCookieChange = () => {
      const newAddress = Cookies.get("address");
      console.log("Cookie changed event - new address:", newAddress);
      setAddress(newAddress);
    };

    window.addEventListener("addressCookieChanged", handleCookieChange);
    return () => window.removeEventListener("addressCookieChanged", handleCookieChange);
  }, []);

  return address;
};
