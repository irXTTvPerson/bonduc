import type { NextPage } from "next"
import { useState } from "react"
import css from "@/styles/components/podForm.module.css"

type Props = {
  onSuccess: (json: any) => void
  onFail: (error: any) => void
}

const PodForm: NextPage<Props> = (props: Props) => {
  const [password, setPassword] = useState(<></>)
  const [additionalBody, setAdditionalBody] = useState(<></>)
  const [partial, setPartial] = useState(<></>)
  const [state, setState] = useState("")
  const isInvalidDate = (date: Date) => Number.isNaN(date.getTime())
  const [formData, setFormData] = useState<any>({
    visibility: "anyone",
    timeline_type: "global",
    pod_type: "pod",
    nsfw: false,
    read_more: false,

    body: {
      body: ""
    }
  })

  return (
    <>
      <div>
        <textarea
          className={css.pod_area}
          placeholder={"何か書くのを待っています..."}
          onChange={(e) => {
            formData.body.body = e.target.value
            setFormData(formData)
          }}
        />
      </div>

      <div>
        NSFW🔞:
        <input
          type={"checkbox"}
          onChange={(e) => {
            formData.nsfw = e.target.checked
            setFormData(formData)
          }}
        />
      </div>

      <div>
        公開日指定:
        <input type={"datetime-local"}
          onChange={(e) => {
            formData["reveal_at"] = new Date(e.target.value)
            if (isInvalidDate(formData.reveal_at)) {
              delete formData.reveal_at
            }
            setFormData(formData)
          }}
        />
      </div>

      <div>
        削除日指定:
        <input type={"datetime-local"}
          onChange={(e) => {
            formData["expire_at"] = new Date(e.target.value)
            if (isInvalidDate(formData.expire_at)) {
              delete formData.expire_at
            }
            setFormData(formData)
          }}
        />
      </div>

      <div>
        公開範囲:
        <select
          defaultValue={"anyone"}
          onChange={(e) => {
            formData.visibility = e.target.value
            setFormData(formData)
          }}
        >
          <option value={"anyone"}>誰にでも</option>
          <option value={"myself"}>自分のみ</option>
        </select>
      </div>

      <div>
        投稿先:
        <select
          defaultValue={"global"}
          onChange={(e) => {
            formData.timeline_type = e.target.value
            setFormData(formData)
          }}
        >
          <option value={"home"}>ホーム</option>
          <option value={"local"}>ローカル</option>
          <option value={"social"}>ソーシャル</option>
          <option value={"global"}>グローバル</option>
        </select>
      </div>

      <div>
        podタイプ:
        <select
          defaultValue={"pod"}
          onChange={(e) => {
            if (e.target.value === "encrypted") {
              setPassword(
                <>
                  🔐
                  <input type={"password"}
                    onChange={(e) => {
                      formData.body["password"] = e.target.value
                      setFormData(formData)
                    }}
                  />
                </>)
            } else {
              delete formData.body.password
              setPassword(<></>)
            }

            if (e.target.value === "partial") {
              setPartial(
                <>
                  伏せ字公開先:
                  <select
                    defaultValue={"follower"}
                    onChange={(e) => {
                      formData.body["show_partial_for"] = e.target.value
                      setFormData(formData)
                    }}
                  >
                    <option value={"follower"}>フォロワー</option>
                  </select>
                </>)
              formData.body["show_partial_for"] = "follower"
            }
            else {
              delete formData.body.unprintable_body
              delete formData.body.unprintable_additional_body
              delete formData.body.show_partial_for
              setPartial(<></>)
            }

            formData.pod_type = e.target.value
            setFormData(formData)
          }}
        >
          <option value={"pod"}>通常</option>
          <option value={"encrypted"}>パスワード</option>
          <option value={"partial"}>伏せ字</option>
        </select>
      </div>

      {password}
      {partial}

      <div>
        続きを書く:
        <input
          type={"checkbox"}
          onChange={(e) => {
            if (e.target.checked) {
              setAdditionalBody(
                <textarea
                  className={css.pod_area}
                  placeholder={"ここの文章は折りたたまれます"}
                  onChange={(e) => {
                    formData.body["additional_body"] = e.target.value
                    setFormData(formData)
                  }}
                />)
            }
            else {
              delete formData.body.additional_body
              setAdditionalBody(<></>)
            }
            formData.read_more = e.target.checked
            setFormData(formData)
          }}
        />
      </div>

      {additionalBody}

      <div>
        <button
          onClick={async () => {
            setState("Sending...")

            if (formData.pod_type === "partial") {
              if (formData.body.body.match(/\[/g).length !== formData.body.body.match(/\]/g).length) {
                setState("[ と ] が一致しません")
                return
              }
              const convert = (target: string) => {
                let result = ""
                let o = [], c = []
                for (let i = 0; i < target.length; i++) {
                  if (target[i] === "[") o.push(i)
                  if (target[i] === "]") c.push(i)
                }
                let start = 0, end = o[0]
                if (start > end) throw new Error("[と]の順が不正です")
                for (let i = 0; i < o.length; i++) {
                  result += target.substring(start, end)
                  start = end + 1
                  end = c[i]
                  if (start > end) throw new Error("[と]の順が不正です")
                  result += target.substring(start, end).replace(/./g, "○")
                  start = end + 1
                  end = o[i + 1]
                  if (start > end) throw new Error("[と]の順が不正です")
                }
                result += target.substring(start, end)
                return result
              }
              try {
                formData.body["unprintable_body"] = convert(formData.body.body)
                if (formData.read_more) {
                  formData.body["unprintable_additional_body"] = convert(formData.body.additional_body)
                }
              } catch (e) {
                console.error(e)
                setState("Failed")
                props.onFail(e)
                return
              }
            }

            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/pod/post`, {
                headers: {
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(formData),
                mode: "cors",
                credentials: "include"
              })
              setState(res.statusText)
              props.onSuccess(await res.json())
            } catch (e) {
              console.error(e)
              setState("Failed")
              props.onFail(e)
            }
          }}
        >
          pod
        </button>

        <div>
          {state}
        </div>
      </div>
    </>
  )
}

export default PodForm
