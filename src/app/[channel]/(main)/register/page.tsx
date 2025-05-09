import React from "react";
import { RegisterForm } from "@/ui/components/RegisterForm";

interface RegisterPageParams {
	params: {
		channel: string;
	};
}

const RegisterPage = ({ params }: RegisterPageParams) => {
	return (
		<main>
			<RegisterForm params={params} />
		</main>
	);
};

export default RegisterPage;
