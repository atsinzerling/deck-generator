import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CountdownRedirectOptions {
  message: string;
  countdown?: number;
  redirectPath: string;
}

export const countdownRedirect = () => {
  const router = useRouter();

  const startCountdownRedirect = ({
    message,
    countdown = 1,
    redirectPath,
  }: CountdownRedirectOptions) => {
    const toastErrorId = toast.error(message);
    const toastLoadingId = toast.loading(`Redirecting to home...`);

    setTimeout(() => {
      router.push(redirectPath);
      toast.dismiss(toastErrorId);
      toast.dismiss(toastLoadingId);
    }, countdown * 1000);

    // const timerId = setInterval(() => {
    //   remainingTime--;
      
    //   if (remainingTime > 0) {
    //     toast.update(toastId, {
    //       render: `Redirecting in ${remainingTime}...`,
    //     });
    //   } else {
    //     clearInterval(timerId);
    //     toast.dismiss(toastId);
    //     router.push(redirectPath);
    //   }
    // }, 1000);

    // Return a cleanup function to clear the interval if needed

  };

  return { startCountdownRedirect };
};