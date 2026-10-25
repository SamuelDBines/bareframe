import { Link, useNavigate } from 'react-router-dom';

export function SignUpPage() {
	const navigate = useNavigate();

	return (
		<div style={{ maxWidth: 440, margin: '0 auto' }}>
			<div className="page-hero" style={{ textAlign: 'center' }}>
				<h1>Create your account</h1>
				<p>Mock sign-up — continues to Designer dashboard.</p>
			</div>
			<form
				className="card form-stack"
				onSubmit={(e) => {
					e.preventDefault();
					navigate('/designer');
				}}
			>
				<div className="field">
					<label htmlFor="name">Full name</label>
					<input id="name" name="name" placeholder="Sam Bines" required />
				</div>
				<div className="field">
					<label htmlFor="email">Work email</label>
					<input id="email" name="email" type="email" placeholder="you@company.com" required />
				</div>
				<div className="field">
					<label htmlFor="password">Password</label>
					<input id="password" name="password" type="password" required />
				</div>
				<button type="submit" className="btn btn-primary">Create account</button>
				<p style={{ margin: 0, fontSize: '0.875rem' }}>
					Already have an account? <Link to="/sign-in">Sign in</Link>
				</p>
			</form>
		</div>
	);
}
