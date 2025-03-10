"use client";

import { Hooks } from "@matchain/matchid-sdk-react";
import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { TallyFormDialog } from "./tally-form-dialog";
import LoginModalDialog from "@/dialogs/login-modal-dialog";
import { REWARDS } from "@/constants/rewards";

const { useUserInfo } = Hooks;

export default function Rewards({
  cnyRewardStatus,
}: {
  cnyRewardStatus: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {REWARDS.map((reward) => (
        <Item key={reward.id} reward={reward} cnyRewardStatus={cnyRewardStatus} />
      ))}
    </div>
  );
}

function Item({
  reward,
  cnyRewardStatus,
}: {
  reward: CampaignReward;
  cnyRewardStatus: boolean;
}) {
  const { address } = useUserInfo();
  return (
    <Card className="flex flex-col justify-between bg-transparent text-white" variant="outline">
      <CardContent className="flex items-center justify-center p-4">
        <AspectRatio ratio={1 / 1}>
          {reward.image && (
            <Image src={reward.image} alt={reward.name} fill className="rounded-xl object-cover" />
          )}
        </AspectRatio>
      </CardContent>
      <CardHeader className="space-y-2">
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription className="space-y-2">
          <p>{address ? reward.description.authenticated : reward.description.unauthenticated}</p>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        {address && cnyRewardStatus ? (
          <TallyFormDialog
            formId="mJM07J"
            title="Claim your reward"
            trigger={<Button>Claim</Button>}
          />
        ) : address ? (
          <Button>You didn't win this time</Button>
        ) : (
          <LoginModalDialog>
            <Button>Login to reveal</Button>
          </LoginModalDialog>
        )}
      </CardFooter>
    </Card>
  );
}
