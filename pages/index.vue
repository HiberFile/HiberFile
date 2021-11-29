<template>
  <div class="h-screen">
    <Header :onclicklogo="setAsHome" />
    <div class="flex-grow flex flex-row items-center justify-start my-8">
      <div
        class="flex flex-row items-start justify-start w-full relative h-auto max-w-3xl"
      >
        <MainCard
          ref="mainCard"
          class="flex-shrink-0 relative h-auto"
          style="transition: 0.2s"
          :style="{
            transform:
              optionsShown ||
              (!mobile &&
                !(
                  (filelistNotEmpty && !fileId && !mobile) ||
                  (!filelistNotEmpty &&
                    mergedFileHistory &&
                    mergedFileHistory.length > 0)
                ))
                ? 'translateX(calc(50vw - 50% - 2rem))'
                : 'translateX(0)'
          }"
          dropzone-style
          dropzone-extend
        >
          <CardContent
            v-if="!fileId"
            class="dropzone dragover:border-white dragover:bg-blue-600"
            dropzone-style
            dropzone-extend
          >
            <Dropzone
              v-model="filelist"
              class="dropzone flex flex-col items-center"
            >
              <div
                class="flex-grow flex flex-row w-full w-max-content min-w-max-content"
                :class="{
                  transform: mobile,
                  'translate-x-0': mobile && !optionsShown,
                  '-translate-x-full': mobile && optionsShown,
                  'justify-start': mobile,
                  'justify-center': !mobile
                }"
              >
                <div
                  class="send-area flex flex-wrap justify-center flex-shrink-0"
                  :class="{
                    'w-full': mobile
                  }"
                >
                  <div
                    class="flex flex-col items-center justify-between self-stretch"
                  >
                    <Plus class="w-8 h-8" dropzone-clickable />
                    <div class="my-12 flex flex-col items-center">
                      <div
                        class="send-area__files mb-6 text-lg text-blue-700 w-full inline-grid font-medium"
                        dropzone-clickable
                      >
                        <p v-if="mobile" class="text-center">
                          <span v-if="filelist.length === 0">{{
                            $t('select_files')
                          }}</span>
                          <span v-else-if="filelist.length === 1">{{
                            $t('file_selected')
                          }}</span>
                          <i18n
                            v-else
                            class="truncate cursor-pointer"
                            path="files_selected"
                            tag="span"
                          >
                            <template #number>
                              <span>{{ filelist.length }}</span>
                            </template>
                          </i18n>
                        </p>
                        <p v-else-if="!mobile" class="text-center">
                          {{ $t('select_files') }}
                        </p>
                      </div>
                      <HFButton
                        :value="
                          !optionsShown
                            ? $t('show_options')
                            : $t('hide_options')
                        "
                        @click.native="toggleOptions"
                      />
                    </div>
                    <HFButton
                      :value="
                        state === 'zip' || state === 'upload'
                          ? $t('loading')
                          : $t('send_now_btn')
                      "
                      @click.native="uploadFile"
                    />
                  </div>
                </div>
                <div
                  v-show="optionsShown"
                  class="w-full md:w-64 overflow-x-hidden relative flex-shrink-0"
                  :class="{
                    'ml-8': !mobile
                  }"
                >
                  <div class="overflow-y-auto h-full max-h-full absolute">
                    <div
                      v-if="mobile"
                      class="mb-6 flex items-center"
                      @click="toggleOptions"
                    >
                      <BackArrow class="w-4 mr-2" />
                      <LittleButton :value="$t('back')" />
                    </div>
                    <HFOption :name="$t('expiration_time')">
                      <select
                        id="duration"
                        ref="duration"
                        class="send-area__duration outline-none text-base text-blue-700 font-light bg-opacity-0 bg-white"
                      >
                        <option value="1_hour">{{ $t('dur_1_hour') }}</option>
                        <option value="1_day">{{ $t('dur_1_day') }}</option>
                        <option value="3_days">{{ $t('dur_3_days') }}</option>
                        <option value="7_days">{{ $t('dur_7_days') }}</option>
                        <option value="30_days">{{ $t('dur_30_days') }}</option>
                        <option value="never">{{ $t('dur_never') }}</option>
                      </select>
                    </HFOption>
                    <HFOption v-if="loggedIn" :name="$t('private_file')">
                      <HFSwitch v-model="privateFile" />
                    </HFOption>
                    <HFOption>
                      <HFInput
                        v-model="renamedFile"
                        :placeholder="$t('rename_file')"
                      />
                    </HFOption>
                    <HFButton
                      v-show="!moreOptionsShown"
                      :value="$t('more_options')"
                      class="more-options__btn"
                      @click.native="showMoreOptions"
                    />
                    <HFOption v-show="moreOptionsShown">
                      <HFInput
                        v-model="whUploading"
                        :placeholder="$t('webhook_uploading')"
                      />
                    </HFOption>
                    <HFOption v-show="moreOptionsShown">
                      <HFInput
                        v-model="whUploaded"
                        :placeholder="$t('webhook_uploaded')"
                      />
                    </HFOption>
                    <HFOption v-show="moreOptionsShown">
                      <HFInput
                        v-model="whDownloading"
                        :placeholder="$t('webhook_downloading')"
                      />
                    </HFOption>
                  </div>
                </div>
              </div>
            </Dropzone>
          </CardContent>
          <CardContent v-else>
            <div>
              <div class="file-ready flex flex-col items-center">
                <Loader v-if="state === 'upload'" class="w-8 h-8" />
                <Check v-else-if="state !== 'error'" class="w-8 h-8" />
                <Cross v-else class="w-8 h-8" />
                <div class="my-12 flex flex-col w-full items-center">
                  <h4
                    class="text-lg text-center text-blue-700 font-medium mb-6 text-center"
                  >
                    {{
                      state === 'error'
                        ? $t('upload_error')
                        : state != null
                        ? $t('soon_ready')
                        : $t('ready')
                    }}
                  </h4>
                  <HFButton
                    ref="downloadableLink"
                    :value="`${origin}/d/${fileId}`"
                    class="file-ready__link block truncate"
                    :class="{
                      'w-full': !(fileId && vuePetsShown),
                      'w-auto': fileId && vuePetsShown
                    }"
                    @click.native="copyLink"
                  />
                </div>
                <div
                  v-if="state !== 'error'"
                  :class="{
                    'w-full': !(fileId && vuePetsShown),
                    'w-auto': fileId && vuePetsShown
                  }"
                >
                  <HFButton
                    :value="$t('copy_in_clipboard')"
                    class="text-center"
                    @click.native="copyLink"
                  />
                  <HFButton
                    v-if="shareAvailable && mobile"
                    :value="$t('share')"
                    class="text-center"
                    @click.native="shareLink"
                  />
                  <HFButton
                    v-else-if="!mobile"
                    :value="$t('show_qr')"
                    class="text-center"
                    @click.native="showQR"
                  />
                </div>
                <!-- <HFButton
									:value="$t('return_to_home')"
									@click.native="setAsHome"
								/> -->
                <template v-if="state != null">
                  <progress
                    v-if="uploadProgress && 100 > uploadProgress"
                    class="rounded-sm w-full h-1 mt-6"
                    max="100"
                    :value="uploadProgress"
                  ></progress>
                </template>
              </div>
            </div>
          </CardContent>
        </MainCard>
        <div
          v-show="
            !filelistNotEmpty &&
            mergedFileHistory &&
            mergedFileHistory.length > 0 &&
            !mobile &&
            !optionsShown
          "
          class="ml-8 min-w-0 absolute h-full overflow-auto"
          style="left: 28rem; width: calc(100% - 30rem)"
        >
          <p class="text-lg font-medium mb-8">{{ $t('your_links') }}</p>
          <table class="table-fixed w-full">
            <tbody>
              <tr v-for="file in mergedFileHistory" :key="file.fileId">
                <td class="text-lg font-normal pr-4 w-5/12 truncate">
                  {{ file.filename }}
                </td>
                <td
                  class="pl-4 underline cursor-pointer text-xs"
                  @click="() => copyLink(`${origin}/d/${file.fileId}`)"
                >
                  {{ $t('copy_in_clipboard') }}
                </td>
                <td
                  v-if="!mobile"
                  class="pl-4 underline cursor-pointer text-xs"
                  @click="() => showQR(`${origin}/d/${file.fileId}`)"
                >
                  {{ $t('show_qr') }}
                </td>
                <td
                  v-else-if="mobile"
                  class="pl-4 underline cursor-pointer text-xs"
                  @click="
                    () =>
                      shareLink({
                        name: file.filename,
                        link: `${origin}/d/${file.fileId}`
                      })
                  "
                >
                  {{ $t('share') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-show="filelistNotEmpty && !fileId && !mobile && !optionsShown"
          class="ml-8 min-w-0 absolute h-full overflow-auto"
          style="left: 28rem; width: calc(100% - 30rem)"
        >
          <p class="text-lg font-medium mb-8">
            <span v-if="filelist.length === 1">{{ $t('file_selected') }}</span>
            <i18n v-else path="files_selected" tag="span">
              <template #number>
                <span>{{ filelist.length }}</span>
              </template>
            </i18n>
          </p>
          <ul v-cloak>
            <li
              v-for="(file, key) in filelist"
              :key="key"
              class="text-white inline-flex w-full"
            >
              <p class="truncate">{{ file.name }}</p>
              <!-- <span class="text-xs italic"
						>({{ Math.round((file.size / 10 ** 6) * 100) / 100 }}Mb)</span> -->
              <button
                type="button"
                title="Remove file"
                class="ml-2 focus:outline-none"
                @click="removeFile(filelist.indexOf(file))"
              >
                ✕
              </button>
            </li>
          </ul>
        </div>
        <div
          v-if="vuePetsShown && fileId"
          class="absolute z-0"
          style="left: 100%; transform: translateY(-100%)"
          :style="{
            width: `${mainCardPosition.width}px`,
            height: `calc(${mainCardPosition.top}px - 3rem)`,
            left: `calc(${mainCardPosition.left}px - 2rem)`
          }"
        >
          <VuePets class="w-full h-full" />
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import isMobile from 'assets/scripts/isMobile';
import VuePets from 'vue-pets';
import 'vue-pets/dist/style.css';
import { SweetAlertOptions } from 'sweetalert2';
import uploadFile from './../utils/uploadFile';
import { accountStore } from '~/store';
import getUserFiles from '~/utils/getUserFiles';

@Component({
  components: { VuePets },
  computed: {
    mainCardPosition: {
      cache: false,
      get() {
        return (this.$refs.mainCard as Vue).$el.getBoundingClientRect();
      }
    }
  }
})
export default class Index extends Vue {
  filelist: Array<File> = [];
  filelistSize: number = 0;
  fileId: string | null = null;
  filename: string | null = null;
  filesize: number | null = null;
  elapsed: Date | null = null;
  remaining: Date | null = null;
  privateFile: boolean | null = null;
  renamedFile: string | null = null;
  whUploading: string | null = null;
  whUploaded: string | null = null;
  whDownloading: string | null = null;
  uploadProgress: number | null = null;
  host: string | null = null;
  origin: string | null = null;
  state: string | null = null;
  mobile: boolean | null = null;
  fileHistory:
    | { fileId: string; filename: string; expire: Date }[]
    | null = null;

  syncFileHistory:
    | { fileId: string; filename: string; expire: Date }[]
    | null = null;

  optionsShown: boolean = false;
  moreOptionsShown: boolean = false;
  vuePetsTimeout: boolean = false;

  mainCardPosition!: { cache: boolean; get(): DOMRect };

  get vuePetsShown() {
    return !this.mobile && this.vuePetsTimeout;
  }

  get filelistNotEmpty() {
    return this.filelist.length > 0;
  }

  get shareAvailable() {
    return navigator.share !== undefined;
  }

  get mergedFileHistory() {
    return this.fileHistory
      ? this.fileHistory
          .concat(this.syncFileHistory || [])
          .filter(
            (file, index, self) =>
              index ===
              self.findIndex(
                (f) => f.fileId === file.fileId && f.filename === file.filename
              )
          )
      : this.syncFileHistory;
  }

  get loggedIn() {
    return accountStore.loggedIn;
  }

  @Watch('filelist', {
    deep: true
  })
  filelistChanged(filelist: Array<File>) {
    if (filelist.length > 0)
      this.filelistSize = filelist
        .map((file) => file.size)
        .reduce((previousValue, currentValue) => previousValue + currentValue);

    if (filelist.length === 1) {
      this.renamedFile = filelist[0].name
        .split('.')
        .slice(0, filelist[0].name.split('.').length - 1)
        .join('.');
    } else {
      this.renamedFile = '';
    }
  }

  beforeMount() {
    this.mobile = isMobile();
    this.host = window.location.host;
    this.origin = window.location.origin;

    if (this.mobile) {
      this.moreOptionsShown = true;
    }

    accountStore.logInLocalStorage();

    this.fileHistory = (JSON.parse(
      localStorage.getItem('fileHistory') ?? '[]'
    ) as { fileId: string; filename: string; expire: string }[])
      .map((file) =>
        new Date(file.expire).getTime() > new Date().getTime()
          ? {
              ...file,
              expire: new Date(file.expire)
            }
          : undefined
      )
      .filter((el) => el !== undefined) as {
      fileId: string;
      filename: string;
      expire: Date;
    }[];

    this.fetchUserFiles();

    document.documentElement.style.setProperty(
      '--vh',
      `${window.innerHeight * 0.01}px`
    );
  }

  mounted() {
    if (
      new URLSearchParams(location.search).get('source') ===
      'verification-email'
    ) {
      this.Toast({
        icon: 'success',
        iconColor: '#3EC300',
        title: this.$tc('successful_email_verification')
      });
    }
  }

  async fetchUserFiles() {
    if (
      accountStore &&
      accountStore.loggedIn &&
      accountStore.userId &&
      accountStore.token
    )
      this.syncFileHistory = await getUserFiles(
        parseInt(accountStore.userId),
        accountStore.token
      );
  }

  toggleOptions() {
    this.optionsShown = !this.optionsShown;

    if (!this.optionsShown && !this.mobile) {
      this.moreOptionsShown = false;
    }
  }

  showMoreOptions() {
    this.moreOptionsShown = true;
  }

  Toast(options: SweetAlertOptions) {
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

  removeFile(i: number) {
    this.filelist.splice(i, 1);
  }

  async convertToZip() {
    const zip = new JSZip();

    this.filelist.forEach((file) => {
      zip.file(file.name, file);
    });

    const content = await zip.generateAsync({
      type: 'blob'
    });

    return new File([content], 'generated_by_hf--to_be_remplaced.zip');
  }

  async uploadFile() {
    if (process.env.HIBERAPI_URL && !this.uploadProgress) {
      if (this.filelist.length > 0) {
        let fileToUpload: File;

        if (this.filelist.length > 1) {
          this.state = 'zip';
          fileToUpload = await this.convertToZip();
        } else {
          fileToUpload = this.filelist[0];
        }

        this.filesize = fileToUpload.size / 1_000_000_000;

        if (this.filesize >= 21.85) {
          this.Toast({
            icon: 'info',
            iconColor: '#009BF5',
            title: this.$tc('toast_max_size')
          });
        } else {
          try {
            this.state = 'upload';

            setTimeout(() => {
              this.vuePetsTimeout = true;
            }, 5000);

            this.filename = fileToUpload?.name;

            const expireStr = (this.$refs.duration as HTMLInputElement).value;
            let expire: number;

            if (expireStr === '1_hour') expire = 3600;
            else if (expireStr === '1_day') expire = 3600 * 24;
            else if (expireStr === '3_days') expire = 3600 * 24 * 3;
            else if (expireStr === '7_days') expire = 3600 * 24 * 7;
            else if (expireStr === '30_days') expire = 3600 * 24 * 30;
            else if (expireStr === 'never')
              expire =
                (new Date('3333-12-31').getTime() - new Date().getTime()) /
                1000;
            else expire = 3600;

            await uploadFile(
              fileToUpload,
              expire,
              process.env.HIBERAPI_URL!,
              (hiberfileId) => (this.fileId = hiberfileId),
              (progress, remaining, elapsed) => {
                this.uploadProgress = progress;
                this.remaining = remaining;
                this.elapsed = elapsed;
              },
              accountStore.token ?? undefined,
              this.privateFile ?? undefined,
              {
                uploading: this.whUploading,
                uploaded: this.whUploaded,
                downloading: this.whDownloading
              }
            );

            if (this.filename && this.fileId) {
              this.fileHistory = (this.fileHistory ?? []).concat({
                fileId: this.fileId,
                filename:
                  this.filename === 'generated_by_hf--to_be_remplaced.zip'
                    ? `hf_${this.fileId}.zip`
                    : this.filename,
                expire: new Date(new Date().getTime() + expire * 1000)
              });

              localStorage.setItem(
                'fileHistory',
                JSON.stringify(this.fileHistory)
              );
            }

            this.state = null;
          } catch (err) {
            this.Toast({
              icon: 'error',
              iconColor: '#F63F3C',
              title: this.$tc('toast_send_error')
            });

            this.state = 'error';

            this.fileId = null;
            this.uploadProgress = null;
            this.host = null;
          }
        }
      } else {
        this.Toast({
          icon: 'info',
          iconColor: '#009BF5',
          title: this.$tc('toast_add_files')
        });
      }
    } else {
      this.Toast({
        icon: 'error',
        iconColor: '#F63F3C',
        title: this.$tc('toast_hiberapi_error')
      });
    }
  }

  copyLink(link?: string) {
    if (typeof link === 'string') {
      const from = document.createElement('textarea');
      document.body.appendChild(from);
      (from as HTMLTextAreaElement).value = link;
      from.select();
      document.execCommand('copy');
      document.body.removeChild(from);
    } else {
      const from = document.querySelector('.file-ready__link') as Element;
      const range = document.createRange();
      window.getSelection()!.removeAllRanges();
      range.selectNode(from);
      window.getSelection()!.addRange(range);
      document.execCommand('copy');
      window.getSelection()!.removeAllRanges();
    }

    this.Toast({
      icon: 'success',
      iconColor: '#3EC300',
      title: this.$tc('toast_link_copy')
    });
  }

  async showQR(link?: string) {
    this.$swal.fire({
      title: 'Code QR',
      text: this.$tc('toast_qr_code'),
      imageUrl: await QRCode.toDataURL(
        typeof link === 'string'
          ? link
          : ((this.$refs.downloadableLink as Vue).$el as HTMLElement).innerText,
        {
          width: 300
        }
      )
    });
  }

  shareLink(spec?: { link: string; name: string }) {
    if (navigator.share && this.filename) {
      navigator.share({
        title: spec?.name ?? this.filename,
        text: this.$tc('share_link_text'),
        url:
          typeof spec?.link === 'string'
            ? spec?.link
            : (this.$refs.downloadableLink as HTMLElement).innerText
      });
    } else {
      // fallback
    }
  }

  setAsHome() {
    this.filelist = [];
    this.fileId = null;
    this.uploadProgress = null;
    this.vuePetsTimeout = false;
    // window.open('https://www.hiberfile.com', '_self');
  }
}
</script>

<style>
[dropzone-clickable] {
  cursor: pointer;
}

.dropzone.dragover {
  @apply border-white;
}

.dropzone.dragover > * {
  opacity: 0;
}

select#duration {
  background: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20d%3D%22M12%2015l-4.243-4.243%201.415-1.414L12%2012.172l2.828-2.829%201.415%201.414z%22%20fill%3D%22rgba(40%2C81%2C204%2C1)%22%2F%3E%3C%2Fsvg%3E')
    no-repeat 95% 50%;
  padding-right: 20px;
}

main.dragover > div {
  /* @apply bg-blue-600; */
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='96' height='96'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E")
      no-repeat center,
    #2d56d5;
}

main.dragover > div > div {
  @apply border-white;
}

/* .dragover-layer {
	display: none;
}

.dropzone.dragover > .dragover-layer {
	visibility: visible;
	display: inherit;
} */

.more-options__btn {
  @apply text-base text-left;
}

@keyframes progressloading {
  from {
    background-position: left;
  }

  to {
    background-position: right;
  }
}

progress::-webkit-progress-value {
  @apply rounded-sm;

  background: repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.25) 0,
      rgba(255, 255, 255, 0.25) 15px,
      transparent 15px,
      transparent 30px
    ),
    linear-gradient(90deg, #0060df 15px, #0060df 15px);
  animation: 20s linear infinite progressloading;

  /* linear-gradient(90deg, #0060df 15px, #0060df 15px) */
}

progress::-webkit-progress-bar {
  @apply rounded-sm;
  @apply bg-grey-100;
}
</style>
