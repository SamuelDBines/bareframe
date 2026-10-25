import { Link, useNavigate } from 'react-router-dom';

export function SignInPage() {
	const navigate = useNavigate();

	return (
		<div style={{ maxWidth: 440, margin: '0 auto' }}>
			<div className="page-hero" style={{ textAlign: 'center' }}>
				<h1>Welcome back</h1>
				<p>Mock sign-in — opens your Designer workspace.</p>
			</div>
			<form
				className="card form-stack"
				onSubmit={(e) => {
					e.preventDefault();
					navigate('/designer');
				}}
			>
				<div className="field">
					<label htmlFor="email">Email</label>
					<input id="email" name="email" type="email" required />
				</div>
				<div className="field">
					<label htmlFor="password">Password</label>
					<input id="password" name="password" type="password" required />
				</div>
				<button type="submit" className="btn btn-primary">Sign in</button>
				<p style={{ margin: 0, fontSize: '0.875rem' }}>
					New here? <Link to="/sign-up">Create an account</Link>
				</p>
			</form>
		</div>
	);
}
