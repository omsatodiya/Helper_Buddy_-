export async function getCityFromPincode(pincode: string): Promise<{ city: string; state: string } | null> {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data[0].Status === "Success") {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District,
        state: postOffice.State
      };
    }
    throw new Error("Invalid pincode");
  } catch (error) {
    throw new Error("Failed to fetch location details");
  }
} 