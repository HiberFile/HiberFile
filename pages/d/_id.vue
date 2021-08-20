<template>
	<div
		class="p-8 font-sans gradient-radial flex-grow min-h-screen text-white flex flex-col max-w-full"
		:style="{
			'min-height': mobile ? 'calc(var(--vh, 1vh) * 100)' : '',
			'overflow-y': mobile ? 'hidden' : ''
		}"
	>
		<Header :onclicklogo="goToHome" />
		<div class="flex-grow flex flex-row items-center justify-start my-8">
			<div class="flex flex-row items-start justify-start w-full">
				<MainCard
					:style="{
						transform: !mobile ? 'translateX(calc(50vw - 50% - 2rem))' : ''
					}"
				>
					<CardContent>
						<div class="download-file flex flex-col items-center">
							<Loader v-if="uploadState === 'waiting'" class="w-8 h-8" />
							<Cross
								v-else-if="uploadState === 'error' || expireIn == 'finish'"
								class="w-8 h-8"
							/>
							<ArrowDown v-else class="w-8 h-8" />
							<div class="my-6 text-center w-full">
								<h3
									class="text-lg text-center text-blue-700 font-medium truncate"
								>
									{{
										uploadState === 'waiting'
											? $t('waiting_for_file')
											: uploadState === 'error'
											? $t('file_does_not_exist')
											: filename
											? filename
											: $t('loading')
									}}
								</h3>
								<p
									v-if="filePreview && expireIn != 'finish'"
									class="text-xs font-light cursor-pointer underline text-blue-700 mb-2"
									@click="firePreview"
								>
									({{ $t('preview') }})
								</p>
								<h6 class="mb-3 text-center font-medium text-xs text-blue-700">
									{{
										expireIn
											? expireIn === 'never'
												? $t('link_expire_never')
												: expireIn == 'finish'
												? $t('link_expired')
												: `${$t('link_expire_in')} ${
														expireIn.day > 0 ? `${expireIn.day}j` : ''
												  } ${expireIn.hour > 0 ? `${expireIn.hour}h` : ''} ${
														expireIn.minute > 0 ? `${expireIn.minute}m` : ''
												  } ${expireIn.second > 0 ? `${expireIn.second}s` : ''}`
											: ''
									}}
								</h6>
							</div>
							<Button
								v-if="filename && expireIn != 'finish'"
								:value="$t('download')"
								@click.native="download"
							/>
							<Button
								v-if="filename && !mobile"
								:value="$t('show_qr')"
								@click.native="showQR"
							/>
							<Button
								v-else-if="filename && mobile"
								:value="$t('share')"
								@click.native="shareLink"
							/>
						</div>
					</CardContent>
				</MainCard>
			</div>
		</div>
		<Footer />
	</div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'nuxt-property-decorator';
import QRCode from 'qrcode';
import isMobile from 'assets/scripts/isMobile';
import downloadFile from './../../utils/downloadFile';

interface RemainingTime {
	day: number;
	hour: number;
	minute: number;
	second: number;
}

@Component({
	asyncData({ params }) {
		const id = params.id;
		return { id };
	}
})
export default class D extends Vue {
	fileUrl: string | null = null;
	filename: string | null = null;
	expire: string | null = null;
	expireIn: string | RemainingTime | null = null;
	uploadState: 'waiting' | 'error' | 'loading' | null = 'waiting';
	filePreview: string | null = null;
	mobile: boolean | null = null;

	beforeMount() {
		this.mobile = isMobile();

		document.documentElement.style.setProperty(
			'--vh',
			`${window.innerHeight * 0.01}px`
		);
	}

	@Emit()
	expireCalc() {
		if (this.expire) {
			const date = new Date(this.expire);
			const difference = date.getTime() - new Date().getTime();

			if (date >= new Date('3333-12-31')) this.expireIn = 'never';
			else if (difference < 0) this.expireIn = 'finish';
			else {
				this.expireIn = {
					day: Math.floor(difference / (1000 * 3600 * 24)),
					hour: Math.floor(difference / (1000 * 3600)) % 24,
					minute: Math.floor(difference / (1000 * 60)) % 60,
					second: Math.floor(difference / 1000) % 60
				};
			}
		} else {
			this.expireIn = null;
		}
	}

	Toast(options: any) {
		return this.$swal.fire(
			Object.assign(
				{
					toast: true,
					position: 'top-end',
					showConfirmButton: false,
					timer: 3000,
					timerProgressBar: true,
					didOpen: (toast: HTMLElement) => {
						toast.addEventListener('mouseenter', this.$swal.stopTimer);
						toast.addEventListener('mouseleave', this.$swal.resumeTimer);
					}
				},
				options
			)
		);
	}

	async mounted() {
		if (process.env.HIBERAPI_URL) {
			try {
				const getState = async () => {
					try {
						const p = new URLSearchParams(window.location.search).get('p');

						this.uploadState = 'loading';

						let result = await downloadFile(
							((this as unknown) as { id: string }).id,
							process.env.HIBERAPI_URL!
						);

						this.fileUrl = result.downloadUrl;
						this.filename = result.filename;
						this.expire = result.expire;

						this.expireCalc();
						setInterval(this.expireCalc, 1000);

						if (
							this.expireIn != 'finish' &&
							/[\/.](gif|jpg|jpeg|tiff|png)$/i.test(this.filename!) &&
							this.fileUrl
						) {
							const preview = await this.$axios.$get(this.fileUrl, {
								responseType: 'blob'
							});

							this.filePreview = URL.createObjectURL(preview);
						}
					} catch (err) {
						console.error(err);
						if (err.message.includes('code 425')) return 'waiting';
						this.uploadState = 'error';
					}
				};

				let downloadState = await getState();
				if (downloadState === 'waiting') {
					this.uploadState = 'waiting';
					const downloadStateInterval = setInterval(async () => {
						downloadState = await getState();
						if (downloadState !== 'waiting') {
							this.uploadState = null;
							clearInterval(downloadStateInterval);
						} else {
							this.uploadState = 'waiting';
						}
					}, 10000);
				}
			} catch (err) {
				console.error(err);
				this.Toast({
					icon: 'error',
					iconColor: '#F63F3C',
					title: 'Une erreur est survenue lors du chargement des informations.'
				});
			}
		}
	}

	async download() {
		if (this.fileUrl && this.filename && this.expireIn != 'finish') {
			const download = document.createElement('a');

			download.href = this.fileUrl;
			download.download = this.filename;

			download.click();

			download.remove();
		}
	}

	async showQR() {
		this.$swal.fire({
			title: 'Code QR',
			text:
				'Scannez ce code QR pour accéder au lien de téléchargement depuis un autre appareil sans devoir entrer le lien manuellement.',
			imageUrl: await QRCode.toDataURL(window.location.href, {
				width: 300
			})
		});
	}

	shareLink() {
		if (navigator.share && this.filename) {
			navigator
				.share({
					title: this.filename,
					text: this.$tc('share_link_text'),
					url: window.location.href
				})
				.catch(console.error);
		} else {
			// fallback
		}
	}

	firePreview() {
		this.$swal.fire({
			title: 'Prévisualisation',
			text: this.filename!,
			imageUrl: this.filePreview!
		});
	}

	goToHome() {
		this.$router.push({
			path: '/'
		});
	}
}
</script>

<style>
.hiberfile-logo {
	width: 89px;
	height: auto;
}

progress::-webkit-progress-value {
	@apply rounded-sm;

	background-image: -webkit-linear-gradient(
			-45deg,
			transparent 33%,
			rgba(255, 255, 255, 0.25) 33%,
			rgba(255, 255, 255, 0.25) 66%,
			transparent 66%
		),
		-webkit-linear-gradient(left, #0060df, #0060df);
}

progress::-webkit-progress-bar {
	@apply bg-grey-100;
}
</style>
